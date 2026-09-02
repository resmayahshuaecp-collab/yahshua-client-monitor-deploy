#!/usr/bin/env python3
"""Test the bug creation flow with proper authentication and CSRF."""

import json
import urllib.request
import urllib.error
import http.cookiejar
import http.client
import sys

BACKEND_URL = "http://localhost:8085"

# Set up cookies
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookie_jar),
    urllib.request.HTTPHandler(),
)

def make_request(method, endpoint, data=None, headers=None):
    """Make an HTTP request and return the response."""
    url = f"{BACKEND_URL}{endpoint}"
    default_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    if headers:
        default_headers.update(headers)
    
    body = json.dumps(data).encode('utf-8') if data else None
    
    req = urllib.request.Request(
        url,
        data=body,
        headers=default_headers,
        method=method
    )
    
    try:
        response = opener.open(req)
        content = response.read().decode('utf-8')
        return response.status, response.headers, content
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        return e.code, e.headers, content

# Step 1: Get CSRF cookie
print("=" * 60)
print("Step 1: Getting CSRF cookie...")
print("=" * 60)
status, headers, content = make_request('GET', '/api/auth/csrf')
print(f"Status: {status}")
print(f"Response: {content}")
print(f"Cookies after CSRF: {list(cookie_jar)}")
print()

# Step 2: Login
print("=" * 60)
print("Step 2: Logging in...")
print("=" * 60)
login_data = {
    'email': 'admin@example.com',
    'password': 'pw-12345678'
}
status, headers, content = make_request('POST', '/api/auth/login', login_data)
print(f"Status: {status}")
response = json.loads(content)
print(f"Response: {json.dumps(response, indent=2)}")
print(f"Cookies after login: {list(cookie_jar)}")
for cookie in cookie_jar:
    print(f"  - {cookie.name} = {cookie.value[:20]}...")
print()

# Step 3: Create a bug
print("=" * 60)
print("Step 3: Creating a bug...")
print("=" * 60)

# Get CSRF token from cookie
csrf_token = None
for cookie in cookie_jar:
    if cookie.name == 'csrftoken':
        csrf_token = cookie.value
        break

print(f"CSRF Token: {csrf_token}")

bug_data = {
    'title': 'Test Bug',
    'priority': 'MEDIUM'
}

headers = {}
if csrf_token:
    headers['X-CSRFToken'] = csrf_token

status, headers_resp, content = make_request('POST', '/api/concerns/bugs', bug_data, headers)
print(f"Status: {status}")
print(f"Response: {content}")
print()

print("=" * 60)
if status in [200, 201]:
    print("SUCCESS: Bug created!")
else:
    print(f"FAILED: Status code {status}")
