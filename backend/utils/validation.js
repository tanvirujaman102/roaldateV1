const Joi = require('joi');

const schemas = {
  // User validation schemas
  userRegistration: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name must not exceed 50 characters'
      }),
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name must not exceed 50 characters'
      }),
    phone: Joi.string()
      .pattern(/^[+]?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }),

  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      }),
    twoFactorCode: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .optional()
      .messages({
        'string.length': 'Two-factor code must be exactly 6 digits',
        'string.pattern.base': 'Two-factor code must contain only digits'
      })
  }),

  // Post validation schemas
  createPost: Joi.object({
    content: Joi.string()
      .max(2000)
      .optional()
      .messages({
        'string.max': 'Content must not exceed 2000 characters'
      }),
    tags: Joi.array()
      .items(Joi.string().max(30))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed'
      }),
    location: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Location must not exceed 100 characters'
      }),
    feeling: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Feeling must not exceed 50 characters'
      })
  }),

  // Dating profile validation schemas
  datingProfile: Joi.object({
    bio: Joi.string()
      .min(50)
      .max(500)
      .required()
      .messages({
        'string.min': 'Bio must be at least 50 characters long',
        'string.max': 'Bio must not exceed 500 characters',
        'any.required': 'Bio is required'
      }),
    age: Joi.number()
      .integer()
      .min(18)
      .max(100)
      .optional()
      .messages({
        'number.min': 'Age must be at least 18',
        'number.max': 'Age must not exceed 100'
      }),
    gender: Joi.string()
      .valid('male', 'female', 'other')
      .optional(),
    interestedIn: Joi.array()
      .items(Joi.string().valid('male', 'female', 'other'))
      .max(3)
      .optional()
      .messages({
        'array.max': 'Maximum 3 gender preferences allowed'
      }),
    location: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Location must not exceed 100 characters'
      }),
    interests: Joi.array()
      .items(Joi.string().max(30))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Maximum 20 interests allowed'
      }),
    lookingFor: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Looking for must not exceed 200 characters'
      }),
    relationshipType: Joi.string()
      .valid('casual', 'serious', 'friendship', 'any')
      .optional()
  }),

  // Chat validation schemas
  sendMessage: Joi.object({
    content: Joi.string()
      .max(2000)
      .optional()
      .messages({
        'string.max': 'Message must not exceed 2000 characters'
      }),
    messageType: Joi.string()
      .valid('text', 'image', 'video', 'audio', 'file')
      .optional(),
    replyTo: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid message ID format'
      })
  }),

  // Wallet validation schemas
  addFunds: Joi.object({
    amount: Joi.number()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.max': 'Amount must not exceed 10000',
        'any.required': 'Amount is required'
      }),
    paymentMethod: Joi.string()
      .valid('card', 'paypal', 'stripe')
      .required()
      .messages({
        'any.required': 'Payment method is required'
      })
  }),

  // Report validation schemas
  createReport: Joi.object({
    reason: Joi.string()
      .valid('spam', 'inappropriate', 'harassment', 'fake', 'violence', 'other')
      .required()
      .messages({
        'any.required': 'Reason is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Description must not exceed 500 characters'
      })
  }),

  // Party room validation schemas
  createPartyRoom: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Room name is required',
        'string.max': 'Room name must not exceed 100 characters',
        'any.required': 'Room name is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Description must not exceed 500 characters'
      }),
    type: Joi.string()
      .valid('voice', 'video', 'both')
      .optional(),
    maxParticipants: Joi.number()
      .integer()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'number.min': 'Maximum participants must be at least 2',
        'number.max': 'Maximum participants must not exceed 50'
      }),
    isPrivate: Joi.boolean()
      .optional(),
    password: Joi.string()
      .min(4)
      .max(20)
      .optional()
      .messages({
        'string.min': 'Password must be at least 4 characters',
        'string.max': 'Password must not exceed 20 characters'
      })
  }),

  // Admin validation schemas
  updateUser: Joi.object({
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .optional()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 30 characters'
      }),
    role: Joi.string()
      .valid('user', 'moderator', 'admin')
      .optional(),
    isActive: Joi.boolean()
      .optional(),
    isVerified: Joi.boolean()
      .optional()
  })
};

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    const errorMessage = error.details[0].message;
    throw new Error(errorMessage);
  }
  return value;
};

module.exports = {
  schemas,
  validate
};
