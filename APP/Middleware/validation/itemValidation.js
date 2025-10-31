const validateItem = (req, res, next) => {
    const requiredFields = [
        'item_name',
        'org_id',
        'serial_id',
        'description',
        'condition',
        'purchase_date',
        'assigned_to',
        'status',
        'location',
        'vendor_id'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Validate UUID fields
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const uuidFields = ['org_id', 'assigned_to', 'vendor_id'];
    
    const invalidUuids = uuidFields.filter(field => !uuidPattern.test(req.body[field]));
    if (invalidUuids.length > 0) {
        return res.status(400).json({
            error: `Invalid UUID format for fields: ${invalidUuids.join(', ')}`
        });
    }

    // Validate date format
    const purchaseDate = new Date(req.body.purchase_date);
    if (isNaN(purchaseDate.getTime())) {
        return res.status(400).json({
            error: 'Invalid purchase_date format. Use YYYY-MM-DD'
        });
    }

    // Additional field validations
    if (req.body.serial_id.length > 100) {
        return res.status(400).json({
            error: 'serial_id must be less than 100 characters'
        });
    }

    if (req.body.description.length > 1000) {
        return res.status(400).json({
            error: 'description must be less than 1000 characters'
        });
    }

    if (req.body.condition.length > 100) {
        return res.status(400).json({
            error: 'condition must be less than 100 characters'
        });
    }

    if (req.body.location.length > 255) {
        return res.status(400).json({
            error: 'location must be less than 255 characters'
        });
    }

    next();
};

module.exports = validateItem;