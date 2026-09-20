import prisma from './prisma';

export interface AuditParams {
  action: string;
  entityType: 'Product' | 'Category' | 'Order' | 'User' | 'Review' | 'Auth' | 'Inventory' | 'Payment' | 'Refund' | 'Webhook';
  entityId?: string | null;
  details: string;
  adminEmail: string;
}

export async function logAuditAction({
  action,
  entityType,
  entityId,
  details,
  adminEmail,
}: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId || null,
        details,
        adminEmail,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log entry:', error);
  }
}
