# users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from .models import Branch, Address, UserProfile

User = get_user_model()


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'slug', 'address', 'phone', 'email', 'emoji', 'is_active', 'opening_hours']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'label', 'address_type', 'street', 'city', 'sector', 'cell', 'village', 'instructions', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['date_of_birth', 'gender', 'prefered_language', 'notifications_enabled', 'marketing_opt_in']


class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    profile = UserProfileSerializer(read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'first_name', 'last_name', 'branch', 'branch_name', 'addresses', 'profile', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'role']


class UserCreateSerializer(serializers.ModelSerializer):
    # Phone is the primary identifier for Simba (MoMo). username is optional and
    # auto-generated if not supplied. password_confirm is optional.
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Phone number is required.')
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('An account with this phone number already exists.')
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        confirm = attrs.pop('password_confirm', None)
        if confirm is not None and attrs['password'] != confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def _generate_username(self, phone, email):
        base = (phone or (email.split('@')[0] if email else 'user')).strip() or 'user'
        candidate = base
        i = 1
        while User.objects.filter(username=candidate).exists():
            i += 1
            candidate = f'{base}{i}'
        return candidate

    def create(self, validated_data):
        username = (validated_data.get('username') or '').strip()
        if not username:
            username = self._generate_username(validated_data.get('phone'), validated_data.get('email', ''))
        user = User.objects.create_user(
            username=username,
            email=validated_data.get('email', ''),
            phone=validated_data.get('phone'),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.get_or_create(user=user)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'phone', 'first_name', 'last_name']  # branch is staff-managed, not self-serve


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate_new_password(self, value):
        try:
            validate_password(value, user=self.context['request'].user)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Incorrect password.')
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class SimbaTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Authenticate with phone, email, OR username via a single `login` field.

    Falls back to the standard `username` field if `login` is not provided, so
    existing clients keep working.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['login'] = serializers.CharField(required=False)
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        login = (self.initial_data.get('login')
                 or self.initial_data.get('phone')
                 or self.initial_data.get('email')
                 or self.initial_data.get(self.username_field)
                 or '').strip()
        if login:
            user = User.objects.filter(
                Q(username__iexact=login) | Q(email__iexact=login) | Q(phone=login)
            ).first()
            # Hand SimpleJWT the canonical username it expects.
            attrs[self.username_field] = user.username if user else login
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
