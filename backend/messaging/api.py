from ninja import Router
from django.shortcuts import get_object_or_404

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.refusals import Refusal
from messaging.models import Conversation, Message, ConversationType
from messaging.schemas import ConversationOut, MessageOut, MessageIn

router = Router(tags=["messaging"])


def _get_or_refuse_conversation(conversation_id: int) -> Conversation:
    try:
        return Conversation.objects.get(pk=conversation_id)
    except Conversation.DoesNotExist:
        raise Refusal("not_found", "No conversation with that id.") from None


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
            "messages": [
                {
                    "id": msg.id,
                    "sender": {
                        "id": msg.sender.id,
                        "username": msg.sender.username,
                        "email": msg.sender.email,
                    },
                    "text": msg.text,
                    "created_at": msg.created_at,
                }
                for msg in messages
            ]
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
        "messages": [
            {
                "id": msg.id,
                "sender": {
                    "id": msg.sender.id,
                    "username": msg.sender.username,
                    "email": msg.sender.email,
                },
                "text": msg.text,
                "created_at": msg.created_at,
            }
            for msg in messages
        ]
    }


@router.get("/conversations/{conversation_id}/messages", response=list[MessageOut], auth=None)
def list_messages(request, conversation_id: int):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    conversation = _get_or_refuse_conversation(conversation_id)
    messages = conversation.messages.select_related("sender").all()
    
    return [
        {
            "id": msg.id,
            "sender": {
                "id": msg.sender.id,
                "username": msg.sender.username,
                "email": msg.sender.email,
            },
            "text": msg.text,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]


@router.post("/conversations/{conversation_id}/messages", response=MessageOut, auth=None)
def create_message(request, conversation_id: int, payload: MessageIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    conversation = _get_or_refuse_conversation(conversation_id)
    message = Message.objects.create(
        conversation=conversation,
        sender=request.actor.user,
        text=payload.text
    )
    
    return {
        "id": message.id,
        "sender": {
            "id": message.sender.id,
            "username": message.sender.username,
            "email": message.sender.email,
        },
        "text": message.text,
        "created_at": message.created_at,
    }
