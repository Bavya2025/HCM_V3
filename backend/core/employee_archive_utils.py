"""
Utility functions for archiving employee data before deletion.
"""
from django.core.serializers import serialize
from django.utils import timezone
import json
from django.core.serializers.json import DjangoJSONEncoder


def archive_employee_data(employee, deleted_by, deletion_reason):
    """
    Create a complete archive of employee data before deletion.
    
    Args:
        employee: Employee instance to archive
        deleted_by: User who is deleting the employee
        deletion_reason: Reason for deletion
    
    Returns:
        EmployeeArchive instance
    """
    from .models import EmployeeArchive
    from .serializers import (
        EmployeeSerializer, PositionSerializer, EmployeeDocumentSerializer,
        EmployeeEducationSerializer, EmployeeExperienceSerializer,
        EmployeeEmploymentHistorySerializer, EmployeeBankDetailsSerializer,
        EmployeeEPFODetailsSerializer, EmployeeHealthDetailsSerializer,
        EmployeeSalaryDetailsSerializer, LoginHitSerializer,
        AccountBlockHistorySerializer
    )
    
    # Serialize main employee data
    employee_serializer = EmployeeSerializer(employee)
    employee_data = employee_serializer.data
    
    # Serialize positions
    positions = employee.positions.all()
    positions_data = PositionSerializer(positions, many=True).data if positions.exists() else []
    
    # Serialize documents
    documents = employee.documents.all()
    documents_data = EmployeeDocumentSerializer(documents, many=True).data if documents.exists() else []
    
    # Serialize education
    education = employee.education_records.all()
    education_data = EmployeeEducationSerializer(education, many=True).data if education.exists() else []
    
    # Serialize experience
    experience = employee.experience_records.all()
    experience_data = EmployeeExperienceSerializer(experience, many=True).data if experience.exists() else []
    
    # Serialize employment history
    employment_history = employee.employment_history.all()
    employment_history_data = EmployeeEmploymentHistorySerializer(employment_history, many=True).data if employment_history.exists() else []
    
    # Serialize bank details
    try:
        bank_details = employee.bank_details
        bank_details_data = EmployeeBankDetailsSerializer(bank_details).data
    except:
        bank_details_data = {}
    
    # Serialize EPFO details
    try:
        epfo_details = employee.epfo_details
        epfo_details_data = EmployeeEPFODetailsSerializer(epfo_details).data
    except:
        epfo_details_data = {}
    
    # Serialize health details
    try:
        health_details = employee.health_details
        health_details_data = EmployeeHealthDetailsSerializer(health_details).data
    except:
        health_details_data = {}
    
    # Serialize salary details
    try:
        salary_details = employee.salary_details
        salary_details_data = EmployeeSalaryDetailsSerializer(salary_details).data
    except:
        salary_details_data = {}
    
    # Get login history
    if employee.user:
        login_history = employee.user.login_hits.all()[:100]  # Last 100 logins
        login_history_data = LoginHitSerializer(login_history, many=True).data if login_history.exists() else []
    else:
        login_history_data = []
    
    # Get block history
    block_history = employee.block_history.all()
    block_history_data = AccountBlockHistorySerializer(block_history, many=True).data if block_history.exists() else []
    
    # Get subordinates
    subordinates = employee.subordinates.all()
    subordinates_data = [{'id': sub.id, 'name': sub.name, 'employee_code': sub.employee_code} for sub in subordinates]
    
    # Track created/modified records (simplified - can be expanded)
    created_records = {
        'note': 'Record creation tracking can be implemented with audit logging'
    }
    modified_records = {
        'note': 'Record modification tracking can be implemented with audit logging'
    }
    
    def to_json_safe(data):
        return json.loads(json.dumps(data, cls=DjangoJSONEncoder))

    # Create archive with JSON-safe data
    archive = EmployeeArchive.objects.create(
        original_employee_id=employee.id,
        employee_code=employee.employee_code,
        deleted_by=deleted_by,
        deletion_reason=deletion_reason,
        employee_data=to_json_safe(employee_data),
        positions_data=to_json_safe(positions_data),
        documents_data=to_json_safe(documents_data),
        education_data=to_json_safe(education_data),
        experience_data=to_json_safe(experience_data),
        employment_history_data=to_json_safe(employment_history_data),
        bank_details_data=to_json_safe(bank_details_data),
        epfo_details_data=to_json_safe(epfo_details_data),
        health_details_data=to_json_safe(health_details_data),
        salary_details_data=to_json_safe(salary_details_data),
        login_history_data=to_json_safe(login_history_data),
        block_history_data=to_json_safe(block_history_data),
        subordinates_data=to_json_safe(subordinates_data),
        created_records=to_json_safe(created_records),
        modified_records=to_json_safe(modified_records)
    )
    
    return archive


def soft_delete_employee(employee, deleted_by, deletion_reason):
    """
    Soft delete an employee by archiving their data and marking as deleted.
    
    Args:
        employee: Employee instance to delete
        deleted_by: User who is deleting the employee
        deletion_reason: Reason for deletion
    
    Returns:
        tuple: (archive, employee) - The created archive and updated employee
    """
    # Create archive first
    archive = archive_employee_data(employee, deleted_by, deletion_reason)
    
    # Mark employee as deleted
    employee.is_deleted = True
    employee.deleted_at = timezone.now()
    employee.deleted_by = deleted_by
    employee.deletion_reason = deletion_reason
    employee.status = 'Deleted'
    employee.save()
    
    # Optionally deactivate user account
    if employee.user:
        employee.user.is_active = False
        employee.user.save()
    
    return archive, employee
