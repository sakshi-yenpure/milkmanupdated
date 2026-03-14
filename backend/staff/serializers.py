from rest_framework import serializers
from .models import Staff, EmployeeActivity

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

class EmployeeActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeActivity
        fields = '__all__'
        