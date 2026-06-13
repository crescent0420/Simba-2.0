"""
Phase 1 smoke test — exercises the REAL API routes in-process via DRF's
APIClient (no network server needed). Run: python smoke_test.py
"""
import os, django, random, string
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'simba_backend.settings')
os.environ['DJANGO_ALLOWED_HOSTS'] = 'localhost,127.0.0.1,testserver'
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()
c = APIClient()
passed = failed = 0


def check(name, cond, detail=''):
    global passed, failed
    mark = 'PASS' if cond else 'FAIL'
    if cond: passed += 1
    else: failed += 1
    print(f'[{mark}] {name}' + (f'  -> {detail}' if detail and not cond else ''))


sfx = ''.join(random.choices(string.digits, k=5))
phone = '078' + sfx + '0'
pw = 'Simba!Strong9'

# 1. Registration with the exact payload the frontend sends
r = c.post('/api/v1/auth/register/', {'phone': phone, 'password': pw, 'first_name': 'Test'}, format='json')
check('register returns 201', r.status_code == 201, f'{r.status_code} {r.data}')
check('register returns access token', 'access' in r.data, r.data)
check('register returns user object', isinstance(r.data.get('user'), dict), r.data)
gen_username = r.data.get('user', {}).get('username')

# 2. Login with PHONE (frontend-style)
r = c.post('/api/v1/auth/login/', {'login': phone, 'password': pw}, format='json')
check('login by phone returns 200', r.status_code == 200, f'{r.status_code} {r.data}')
check('login returns access token', 'access' in r.data, r.data)
check('login returns user object', isinstance(r.data.get('user'), dict), r.data)
token = r.data.get('access')

# 3. Login with the auto-generated USERNAME also works
r = c.post('/api/v1/auth/login/', {'login': gen_username, 'password': pw}, format='json')
check('login by username also works', r.status_code == 200, f'{r.status_code} {r.data}')

# 4. Authenticated /me/
c.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
r = c.get('/api/v1/auth/me/')
check('GET /me/ with token returns 200', r.status_code == 200, f'{r.status_code}')
check('/me/ has the right phone', r.data.get('phone') == phone, r.data.get('phone'))

# 5. Products list + fixed fields present
c.credentials()  # anonymous
r = c.get('/api/v1/products/')
check('product list returns 200', r.status_code == 200, str(r.status_code))
plist = r.data if isinstance(r.data, list) else r.data.get('results', [])
check('product list non-empty', len(plist) > 0, str(len(plist)))
if plist:
    p0 = plist[0]
    check('has_discount field now present', 'has_discount' in p0, list(p0.keys()))
    check('current_price field now present', 'current_price' in p0, list(p0.keys()))

# 6. Cart add + get (authenticated)
c.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
pid = Product.objects.first().product_id
r = c.post('/api/v1/products/cart/', {'product_id': pid, 'quantity': 2}, format='json')
check('add to cart returns 201', r.status_code == 201, f'{r.status_code} {r.data}')
r = c.get('/api/v1/products/cart/')
check('get cart returns items', r.status_code == 200 and r.data.get('count', 0) >= 1, r.data)

# 7. Create order from cart + list
r = c.post('/api/v1/orders/create/', {'delivery_name': 'Test', 'delivery_phone': phone}, format='json')
check('create order returns 201', r.status_code == 201, f'{r.status_code} {r.data}')
order_no = r.data.get('order_number')
r = c.get('/api/v1/orders/')
olist = r.data if isinstance(r.data, list) else r.data.get('results', [])
check('order list shows the new order', any(o.get('order_number') == order_no for o in olist), olist)

# 8. AUTHORIZATION: a normal buyer must NOT reach rep endpoints
r = c.get('/api/v1/orders/rep/')
check('buyer BLOCKED from /orders/rep/ (403)', r.status_code == 403, f'expected 403 got {r.status_code}')
r = c.get('/api/v1/orders/rep/dashboard/')
check('buyer BLOCKED from rep dashboard (403)', r.status_code == 403, f'expected 403 got {r.status_code}')

# 9. A rep user CAN reach rep endpoints
rep = User.objects.create_user(username='rep_'+sfx, phone='079'+sfx+'1', password=pw, role='rep')
rlog = c.post('/api/v1/auth/login/', {'login': 'rep_'+sfx, 'password': pw}, format='json')
c.credentials(HTTP_AUTHORIZATION=f'Bearer {rlog.data["access"]}')
r = c.get('/api/v1/orders/rep/')
check('rep ALLOWED on /orders/rep/ (200)', r.status_code == 200, f'{r.status_code}')

# 10. Weak password is rejected (validators restored)
c.credentials()
r = c.post('/api/v1/auth/register/', {'phone': '07' + sfx + '999', 'password': '123'}, format='json')
check('weak password rejected (400)', r.status_code == 400, f'{r.status_code} {r.data}')

print(f'\n==== RESULT: {passed} passed, {failed} failed ====')
