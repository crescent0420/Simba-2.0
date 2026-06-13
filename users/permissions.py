# users/permissions.py
from rest_framework.permissions import BasePermission

User_ROLE_REP = 'rep'
User_ROLE_ADMIN = 'admin'


class IsRepOrAdmin(BasePermission):
    """Allow only authenticated users whose role is rep or admin (or Django staff)."""
    message = 'You do not have permission to access staff resources.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'role', None) in (User_ROLE_REP, User_ROLE_ADMIN))
        )


class IsAdmin(BasePermission):
    message = 'Admin access required.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or getattr(user, 'role', None) == User_ROLE_ADMIN)
        )
