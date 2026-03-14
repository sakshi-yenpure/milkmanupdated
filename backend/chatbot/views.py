from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from product.models import Product
from category.models import Category

class ChatbotView(APIView):
    def post(self, request):
        query = request.data.get('query', '').lower()
        if not query:
            return Response({"response": "I didn't quite catch that. Could you please rephrase?"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch dynamic data
        products = Product.objects.filter(is_active=True)
        categories = Category.objects.all()
        
        response = "I'm sorry, I don't have detailed information about that. For more help, please contact our support at support@milkman.com."
        
        if "hello" in query or "hi" in query or "hey" in query:
            response = "Hello! Welcome to Milkman. I can help you with product information, pricing, and subscriptions. How can I assist you today?"
            
        elif "list" in query and ("product" in query or "item" in query):
            product_list = ", ".join([p.name for p in products])
            response = f"We currently have the following fresh products available: {product_list}. You can see all of them in our Products section!"

        elif "category" in query or "categories" in query:
            cat_list = ", ".join([c.name for c in categories])
            response = f"Our products are organized into these categories: {cat_list}. Which one are you interested in?"

        elif "milk" in query:
            milk_products = products.filter(name__icontains='milk')
            if milk_products.exists():
                items = ", ".join([f"{p.name} (${p.price})" for p in milk_products])
                response = f"We have several milk options: {items}. All are sourced fresh daily!"
            else:
                response = "We usually carry Whole, Toned, and Skim milk. Please check the Products page for current availability."

        elif "butter" in query:
            butter_products = products.filter(name__icontains='butter')
            if butter_products.exists():
                items = ", ".join([f"{p.name} (${p.price})" for p in butter_products])
                response = f"Our butter selection includes: {items}. Perfect for your morning toast!"
            else:
                response = "We offer both Salted and Unsalted butter. Check our Products section for details."

        elif "ghee" in query:
            ghee_products = products.filter(name__icontains='ghee')
            if ghee_products.exists():
                items = ", ".join([f"{p.name} (${p.price})" for p in ghee_products])
                response = f"We have premium ghee available: {items}. It's traditional and aromatic!"
            else:
                response = "Our Cow Ghee is a customer favorite. You can find it in the Ghee category."

        elif "paneer" in query or "cheese" in query:
            cheese_products = products.filter(name__icontains='paneer') | products.filter(name__icontains='cheese') | products.filter(name__icontains='cheddar') | products.filter(name__icontains='mozzarella')
            if cheese_products.exists():
                items = ", ".join([f"{p.name} (${p.price})" for p in cheese_products])
                response = f"We have fresh paneer and cheeses: {items}."
            else:
                response = "We offer fresh Paneer, Cheddar, and Mozzarella. Check them out in the Products section!"

        elif "curd" in query or "yogurt" in query or "yoghurt" in query:
            curd_products = products.filter(name__icontains='curd') | products.filter(name__icontains='yogurt') | products.filter(name__icontains='yoghurt')
            if curd_products.exists():
                items = ", ".join([f"{p.name} (${p.price})" for p in curd_products])
                response = f"Our fresh dairy cultures include: {items}. Very healthy and creamy!"
            else:
                response = "We have fresh Curd and Greek Yogurt available. Check out the Curd/Yogurt section in Products."

        elif "price" in query or "cost" in query or "how much" in query:
            # Try to find if they asked about a specific product's price
            found_product = None
            for p in products:
                if p.name.lower() in query:
                    found_product = p
                    break
            if found_product:
                response = f"The current price for {found_product.name} is ${found_product.price}."
            else:
                response = "Our prices are very competitive! For example, Milk starts at around $1.50. Please visit our Products page for the full price list."

        elif "subscribe" in query or "subscription" in query:
            response = "You can subscribe to our daily dairy deliveries! Just go to the 'Subscribe' section, choose a plan (Daily, Weekly, or Monthly), and we'll handle the rest."

        elif "delivery" in query or "when" in query:
            response = "We deliver fresh dairy products every morning between 5:00 AM and 8:00 AM. You can set your specific delivery instructions in your profile."

        elif "account" in query or "profile" in query or "login" in query:
            response = "You can manage your account, track orders, and update delivery details in the 'My Profile' section after logging in."

        elif "contact" in query or "support" in query or "help" in query:
            response = "You can reach our support team at support@milkman.com or call us at 1-800-MILKMAN. We're here to help!"

        elif "thank" in query or "thanks" in query:
            response = "You're very welcome! Happy shopping. Is there anything else I can help you with?"
            
        return Response({"response": response}, status=status.HTTP_200_OK)
