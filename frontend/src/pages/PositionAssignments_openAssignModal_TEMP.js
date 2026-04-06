const openAssignModal = () => {
    console.log('Opening assignment modal...');
    console.log('User:', user);
    console.log('All Employees:', allEmployees);

    // Find current employee in allEmployees
    const currentEmployee = allEmployees?.find(emp => emp.id === user?.employee_profile_id);
    console.log('Current Employee:', currentEmployee);
    console.log('Employee positions:', currentEmployee?.positions_details);

    // Get user's primary position or first position
    const primaryPos = currentEmployee?.positions_details?.find(p => p.is_primary) || currentEmployee?.positions_details?.[0];

    console.log('Selected primary position:', primaryPos);

    const formDataToSet = {
        assignee: '',
        position: primaryPos?.id ? String(primaryPos.id) : '',
        assignment_type: 'NORMAL',
        notes: '',
        expires_at: '',
        _assignee_level_filter: primaryPos?.level ? String(primaryPos.level) : '',
        _assignee_office_filter: primaryPos?.office ? String(primaryPos.office) : '',
        _assignee_rank_filter: primaryPos?.rank ? String(primaryPos.rank) : '',
        _selected_position_name: primaryPos?.name || '',
        _selected_position_office: primaryPos?.office_name || '',
        _selected_position_dept: primaryPos?.department_name || ''
    };

    console.log('Form data being set:', formDataToSet);

    setFormData(formDataToSet);
    setModalType('Position Assignments');
    setShowModal(true);
};
