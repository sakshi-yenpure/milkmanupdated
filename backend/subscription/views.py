from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Subscription
from .serializers import SubscriptionSerializer
from staff.auth import StaffTokenAuthentication
from customer.models import Customer
from product.models import Product

class SubscriptionViewSet(APIView):
    authentication_classes = [StaffTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        subscriptions = Subscription.objects.all()
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, format=None):
        subscription = Subscription.objects.get(pk=pk)
        serializer = SubscriptionSerializer(subscription, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        subscription = Subscription.objects.get(pk=pk)
        subscription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, format=None):
        customer_id = request.data.get("customer_id")
        items = request.data.get("items", [])
        delivery_address = request.data.get("delivery_address")
        delivery_phone = request.data.get("delivery_phone")
        delivery_date = request.data.get("delivery_date")
        delivery_slot = request.data.get("delivery_slot")
        payment_method = request.data.get("payment_method")
        if not customer_id or not isinstance(items, list) or not items:
            return Response({"detail": "Invalid checkout payload"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            customer = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response({"detail": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        created = []
        total = 0.0
        for item in items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            try:
                product = Product.objects.get(pk=product_id, is_active=True)
            except Product.DoesNotExist:
                continue
            sub = Subscription.objects.create(customer=customer, product=product, quantity=quantity, is_active=True)
            created.append({"id": sub.pk, "product_id": product.pk, "quantity": sub.quantity})
            total += float(product.price) * quantity
        billing = {
            "delivery_address": delivery_address or customer.address,
            "delivery_phone": delivery_phone or getattr(customer, "phone", ""),
            "delivery_date": delivery_date,
            "delivery_slot": delivery_slot,
            "payment_method": payment_method or "cod",
        }
        return Response({"created": created, "total": round(total, 2), "billing": billing}, status=status.HTTP_201_CREATED)
