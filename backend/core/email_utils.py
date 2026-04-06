import threading
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email_async(subject, message, recipient_list, from_email=None):
    """
    Sends an email in a background thread to prevent blocking the main request thread.
    """
    if from_email is None:
        from_email = settings.DEFAULT_FROM_EMAIL
        
    def worker():
        try:
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
            logger.info(f"Background email sent to {recipient_list}")
        except Exception as e:
            logger.error(f"Failed to send background email to {recipient_list}: {str(e)}")

    # Start the thread
    thread = threading.Thread(target=worker)
    thread.daemon = True # Ensure thread doesn't hang the process
    thread.start()
