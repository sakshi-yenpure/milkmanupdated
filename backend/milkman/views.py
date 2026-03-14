from django.shortcuts import render
from django.views.generic import TemplateView

# Global in-memory storage for recent activities
RECENT_ACTIVITIES = []

def add_activity(user_email, action):
    from datetime import datetime
    RECENT_ACTIVITIES.insert(0, {
        'email': user_email,
        'action': action,
        'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    # Keep only last 10 activities
    if len(RECENT_ACTIVITIES) > 10:
        RECENT_ACTIVITIES.pop()

class HomeView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['activities'] = RECENT_ACTIVITIES
        return context
