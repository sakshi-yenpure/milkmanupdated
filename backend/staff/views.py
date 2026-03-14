from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated


# Create your views here.
from .models import Staff, EmployeeActivity
from .serializers import StaffSerializer, EmployeeActivitySerializer
from .auth import create_token, StaffTokenAuthentication
from milkman.views import add_activity

def log_employee_activity(email, action):
    EmployeeActivity.objects.create(email=email, action=action)
    add_activity(email, f"Staff {action}")

class EmployeeActivityListView(APIView):
    def get(self, request):
        activities = EmployeeActivity.objects.all().order_by('-timestamp')[:20]
        serializer = EmployeeActivitySerializer(activities, many=True)
        return Response(serializer.data)

class StaffViewSet(APIView):
    authentication_classes = [StaffTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        staff = Staff.objects.all()
        serializer = StaffSerializer(staff, many=True)
        print(serializer.data)
        return Response(serializer.data)

    def post(self, request, format=None):
        data = request.data
        print("line 23", data)
        serializer = StaffSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, pk, format=None):
        staff = Staff.objects.get(pk=pk)
        serializer = StaffSerializer(staff, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        staff = Staff.objects.get(pk=pk)
        staff.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)
        staff, created = Staff.objects.get_or_create(
            email=email,
            defaults={
                "name": (email.split("@")[0] if email else "User"),
                "phone": "0000000000",
                "address": "Local",
                "password": password,
                "is_active": True,
            },
        )
        if not created:
            staff.password = password
            staff.is_active = True
            staff.save(update_fields=["password", "is_active"])
        token = create_token(staff)
        log_employee_activity(staff.email, "Logged in")
        return Response({"token": token, "staff_id": staff.pk, "email": staff.email, "name": staff.name})

class StaffSignupView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, format=None):
        serializer = StaffSerializer(data=request.data)
        if serializer.is_valid():
            staff = serializer.save()
            token = create_token(staff)
            add_activity(staff.email, "Staff Signed up")
            log_employee_activity(staff.email, "Signed up")
            return Response({"token": token, "staff_id": staff.pk, "email": staff.email, "name": staff.name}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffLogoutView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if email:
            log_employee_activity(email, "Logged out")
        return Response(status=status.HTTP_200_OK)
