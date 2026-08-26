from ninja import Router
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.refusals import Refusal
from messaging.models import Conversation, Message, ConversationType
from messaging.schemas import ConversationOut, MessageOut, MessageIn

User = get_user_model()
router = Router(tags=["messaging"])


def _get_or_refuse_conversation(conversation_id: int) -> Conversation:
    try:
        return Conversation.objects.get(pk=conversation_id)
    except Conversation.DoesNotExist:
        raise Refusal("not_found", "No conversation with that id.") from None


def _get_or_refuse_message(message_id: int) -> Message:
    try:
        return Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        raise Refusal("not_found", "No message with that id.") from None


def _format_message(msg: Message) -> dict:
    """Format a message object for API response."""
    return {
        "id": msg.id,
        "sender": {
            "id": msg.sender.id,
            "username": msg.sender.username,
            "email": msg.sender.email,
        },
        "text": msg.text,
        "created_at": msg.created_at,
        "updated_at": msg.updated_at,
        "is_edited": msg.is_edited,
    }


@router.get("/conversations", response=list[ConversationOut], auth=None)
def list_conversations(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    conversations = Conversation.objects.all()
    result = []
    for conv in conversations:
        messages = list(conv.messages.select_related("sender").all())
        result.append({
            "id": conv.id,
            "type": conv.type,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "messages": [_format_message(msg) for msg in messages]
        })
    return result


@router.get("/conversations/{conversation_id}", response=ConversationOut, auth=None)
def get_conversation(request, conversation_id: int):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    conversation = _get_or_refuse_conversation(conversation_id)
    messages = list(conversation.messages.select_related("sender").all())
    
    return {
        "id": conversation.id,
        "type": conversation.type,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "messages": [_format_message(msg) for msg in messages]
    }


@router.get("/conversations/{conversation_id}/messages", response=list[MessageOut], auth=None)
def list_messages(request, conversation_id: int):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    conversation = _get_or_refuse_conversation(conversation_id)
    messages = conversation.messages.select_related("sender").all()
    
    return [_format_message(msg) for msg in messages]


@router.post("/conversations/{conversation_id}/messages", response=MessageOut, auth=None)
def create_message(request, conversation_id: int, payload: MessageIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    conversation = _get_or_refuse_conversation(conversation_id)
    sender = User.objects.get(pk=request.actor.user_id)
    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        text=payload.text
    )
    
    return _format_message(message)


@router.put("/messages/{message_id}", response=MessageOut, auth=None)
def update_message(request, message_id: int, payload: MessageIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    message = _get_or_refuse_message(message_id)
    
    # Only the sender can edit their own message
    if message.sender_id != request.actor.user_id:
        raise Refusal("permission_denied", "You can only edit your own messages.")
    
    message.text = payload.text
    message.is_edited = True
    message.save()
    
    return _format_message(message)


@router.delete("/messages/{message_id}", response={200: dict}, auth=None)
def delete_message(request, message_id: int):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    message = _get_or_refuse_message(message_id)
    
    # Only the sender can delete their own message
    if message.sender_id != request.actor.user_id:
        raise Refusal("permission_denied", "You can only delete your own messages.")
    
    message.delete()
    return {"ok": True}
