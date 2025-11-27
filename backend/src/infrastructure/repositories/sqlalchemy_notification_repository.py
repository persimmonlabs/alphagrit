from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.sql import func
import uuid
from typing import Optional, List

from src.domain.entities.notification import EmailLog, EmailStatus
from src.domain.repositories.notification_repository import AbstractEmailLogRepository
from src.infrastructure.base import Base # Import Base from your dedicated base setup # Import Base from your database setup
from sqlalchemy.orm import Session

# Import ORMs from other domains for relationships
from src.infrastructure.repositories.sqlalchemy_order_repository import OrderORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM


# SQLAlchemy ORM Models
class EmailLogORM(Base):
    __tablename__ = "email_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_email = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    template_name = Column(String(100), nullable=True)
    status = Column(SQLEnum(EmailStatus, name="email_status", create_type=False), default=EmailStatus.PENDING, nullable=False)
    error_message = Column(Text, nullable=True)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=True)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    provider = Column(String(50), nullable=True)
    provider_message_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    order = relationship("OrderORM")
    user = relationship("ProfileORM")

    def to_entity(self) -> EmailLog:
        return EmailLog(
            id=str(self.id),
            recipient_email=self.recipient_email,
            subject=self.subject,
            template_name=self.template_name,
            status=self.status,
            error_message=self.error_message,
            order_id=str(self.order_id) if self.order_id else None,
            user_id=str(self.user_id) if self.user_id else None,
            provider=self.provider,
            provider_message_id=self.provider_message_id,
            created_at=self.created_at
        )

    @staticmethod
    def from_entity(entity: EmailLog) -> 'EmailLogORM':
        return EmailLogORM(
            id=entity.id,
            recipient_email=entity.recipient_email,
            subject=entity.subject,
            template_name=entity.template_name,
            status=entity.status,
            error_message=entity.error_message,
            order_id=entity.order_id,
            user_id=entity.user_id,
            provider=entity.provider,
            provider_message_id=entity.provider_message_id,
            created_at=entity.created_at
        )


# SQLAlchemy Repository Implementations
class SQLAlchemyEmailLogRepository(AbstractEmailLogRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, log_id: str) -> Optional[EmailLog]:
        orm_log = self.session.query(EmailLogORM).filter_by(id=log_id).first()
        return orm_log.to_entity() if orm_log else None

    def get_all(self, recipient_email: Optional[str] = None, status: Optional[EmailStatus] = None, order_id: Optional[str] = None, user_id: Optional[str] = None) -> List[EmailLog]:
        query = self.session.query(EmailLogORM)
        if recipient_email:
            query = query.filter_by(recipient_email=recipient_email)
        if status:
            query = query.filter_by(status=status)
        if order_id:
            query = query.filter_by(order_id=order_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        return [orm_log.to_entity() for orm_log in query.all()]

    def save(self, email_log: EmailLog) -> None:
        orm_log = self.session.query(EmailLogORM).filter_by(id=email_log.id).first()
        if orm_log:
            # Update existing scalar attributes
            # No created_at, id update
            orm_log.recipient_email = email_log.recipient_email
            orm_log.subject = email_log.subject
            orm_log.template_name = email_log.template_name
            orm_log.status = email_log.status
            orm_log.error_message = email_log.error_message
            orm_log.order_id = email_log.order_id
            orm_log.user_id = email_log.user_id
            orm_log.provider = email_log.provider
            orm_log.provider_message_id = email_log.provider_message_id
        else:
            # Add new
            self.session.add(EmailLogORM.from_entity(email_log))
        self.session.commit()

    def delete(self, log_id: str) -> None:
        orm_log = self.session.query(EmailLogORM).filter_by(id=log_id).first()
        if orm_log:
            self.session.delete(orm_log)
            self.session.commit()
