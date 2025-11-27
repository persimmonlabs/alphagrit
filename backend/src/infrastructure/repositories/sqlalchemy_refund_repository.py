from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.sql import func
import uuid
from typing import Optional, List

from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.repositories.refund_repository import AbstractRefundRequestRepository
from src.infrastructure.base import Base # Import Base from your dedicated base setup # Import Base from your database setup
from sqlalchemy.orm import Session

# SQLAlchemy ORM Models
class RefundRequestORM(Base):
    __tablename__ = "refund_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=True) # User who submitted the request
    reason = Column(Text, nullable=True)
    status = Column(SQLEnum(RefundStatus, name="refund_status", create_type=False), default=RefundStatus.PENDING, nullable=False)
    admin_notes = Column(Text, nullable=True)
    processed_by = Column(String(36), ForeignKey("profiles.id"), nullable=True) # Admin who processed the request
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    order = relationship("OrderORM")
    requester = relationship("ProfileORM", foreign_keys=[user_id])
    processor = relationship("ProfileORM", foreign_keys=[processed_by])


    def to_entity(self) -> RefundRequest:
        return RefundRequest(
            id=str(self.id),
            order_id=str(self.order_id),
            user_id=str(self.user_id) if self.user_id else None,
            reason=self.reason,
            status=self.status,
            admin_notes=self.admin_notes,
            processed_by=str(self.processed_by) if self.processed_by else None,
            processed_at=self.processed_at,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: RefundRequest) -> 'RefundRequestORM':
        return RefundRequestORM(
            id=entity.id,
            order_id=entity.order_id,
            user_id=entity.user_id,
            reason=entity.reason,
            status=entity.status,
            admin_notes=entity.admin_notes,
            processed_by=entity.processed_by,
            processed_at=entity.processed_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


# SQLAlchemy Repository Implementations
class SQLAlchemyRefundRequestRepository(AbstractRefundRequestRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, request_id: str) -> Optional[RefundRequest]:
        orm_request = self.session.query(RefundRequestORM).filter_by(id=request_id).first()
        return orm_request.to_entity() if orm_request else None

    def get_all(self, order_id: Optional[str] = None, user_id: Optional[str] = None, status: Optional[RefundStatus] = None) -> List[RefundRequest]:
        query = self.session.query(RefundRequestORM)
        if order_id:
            query = query.filter_by(order_id=order_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)
        return [orm_request.to_entity() for orm_request in query.all()]

    def save(self, refund_request: RefundRequest) -> None:
        orm_request = self.session.query(RefundRequestORM).filter_by(id=refund_request.id).first()
        if orm_request:
            # Update existing scalar attributes
            for key, value in RefundRequestORM.from_entity(refund_request).__dict__.items():
                if not key.startswith('_'):
                    setattr(orm_request, key, value)
        else:
            # Add new
            self.session.add(RefundRequestORM.from_entity(refund_request))
        self.session.commit()

    def delete(self, request_id: str) -> None:
        orm_request = self.session.query(RefundRequestORM).filter_by(id=request_id).first()
        if orm_request:
            self.session.delete(orm_request)
            self.session.commit()
