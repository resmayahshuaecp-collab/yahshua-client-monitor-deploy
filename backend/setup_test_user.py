#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import UserProfile, Role

User = get_user_model()

# Check if user exists
user = User.objects.filter(email='admin@example.com').first()
if not user:
    user = User.objects.create_user(
        username='admin@example.com',
        email='admin@example.com',
        password='pw-12345678'
    )
    print(f"Created user: {user.email}")
else:
    print(f"User already exists: {user.email}")

# Create or update profile with role
profile, created = UserProfile.objects.get_or_create(user=user)
if not profile.role:
    profile.role = Role.ADMIN
    profile.display_name = "Admin User"
    profile.save()
    print(f"Created profile with role: {profile.role}")
else:
    print(f"Profile already has role: {profile.role}")

print("Done!")
