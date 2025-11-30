"""Add authentication columns to profiles table

Revision ID: 0001
Revises: None
Create Date: 2024-11-29

This migration adds password_hash, refresh_token_hash, and last_login_at
columns to support JWT authentication.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add authentication columns to profiles table."""
    # Add password_hash column
    op.add_column(
        'profiles',
        sa.Column('password_hash', sa.String(255), nullable=True)
    )

    # Add refresh_token_hash column
    op.add_column(
        'profiles',
        sa.Column('refresh_token_hash', sa.String(255), nullable=True)
    )

    # Add last_login_at column
    op.add_column(
        'profiles',
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    """Remove authentication columns from profiles table."""
    op.drop_column('profiles', 'last_login_at')
    op.drop_column('profiles', 'refresh_token_hash')
    op.drop_column('profiles', 'password_hash')
