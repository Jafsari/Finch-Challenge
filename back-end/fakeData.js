// Fake data for demo - different data for each employer
// Note: 'justin-test' is NOT included here - it uses the original API implementation

var fakeData = {
  'ramp': {
    company: {
      id: 'ramp-001',
      legal_name: 'Ramp Financial Inc.',
      name: 'Ramp',
      primary_email: 'hello@ramp.com',
      primary_phone_number: '+1 (555) 200-0002',
      ein: '98-7654321',
      entity: {
        type: 'corporation',
        subtype: 'c_corp'
      },
      locations: [
        {
          line1: '200 Financial Plaza',
          line2: 'Floor 15',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA'
        }
      ],
      accounts: [
        {
          account_name: 'Ramp Operating Account',
          account_number: '****5678',
          account_type: 'checking',
          routing_number: '****9012'
        }
      ],
      departments: [
        { name: 'Finance', parent: null },
        { name: 'Operations', parent: null },
        { name: 'Customer Success', parent: null }
      ]
    },
    employees: [
      {
        id: 'ramp-emp-001',
        first_name: 'David',
        last_name: 'Chen',
        middle_name: null,
        manager: { id: 'ramp-emp-002' },
        department: { name: 'Finance' },
        is_active: true
      },
      {
        id: 'ramp-emp-002',
        first_name: 'Jessica',
        last_name: 'Martinez',
        middle_name: 'Ann',
        manager: null,
        department: { name: 'Finance' },
        is_active: true
      },
      {
        id: 'ramp-emp-003',
        first_name: 'Robert',
        last_name: 'Taylor',
        middle_name: 'James',
        manager: { id: 'ramp-emp-002' },
        department: { name: 'Operations' },
        is_active: true
      }
    ],
    employeeDetails: {
      'ramp-emp-001': {
        individual: {
          first_name: 'David',
          last_name: 'Chen',
          email: 'david.chen@ramp.com'
        },
        employment: {
          id: 'ramp-emp-001',
          first_name: 'David',
          last_name: 'Chen',
          middle_name: null,
          title: 'Financial Analyst',
          department: { name: 'Finance' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: { id: 'ramp-emp-002' },
          start_date: '2023-02-10',
          is_active: true,
          location: {
            line1: '200 Financial Plaza',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'USA'
          },
          income: {
            amount: 110000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      },
      'ramp-emp-002': {
        individual: {
          first_name: 'Jessica',
          last_name: 'Martinez',
          email: 'jessica.martinez@ramp.com'
        },
        employment: {
          id: 'ramp-emp-002',
          first_name: 'Jessica',
          last_name: 'Martinez',
          middle_name: 'Ann',
          title: 'Finance Director',
          department: { name: 'Finance' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: null,
          start_date: '2021-09-15',
          is_active: true,
          location: {
            line1: '200 Financial Plaza',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'USA'
          },
          income: {
            amount: 165000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      },
      'ramp-emp-003': {
        individual: {
          first_name: 'Robert',
          last_name: 'Taylor',
          email: 'robert.taylor@ramp.com'
        },
        employment: {
          id: 'ramp-emp-003',
          first_name: 'Robert',
          last_name: 'Taylor',
          middle_name: 'James',
          title: 'Operations Manager',
          department: { name: 'Operations' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: { id: 'ramp-emp-002' },
          start_date: '2023-05-22',
          is_active: true,
          location: {
            line1: '200 Financial Plaza',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'USA'
          },
          income: {
            amount: 125000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      }
    },
    payStatements: {
      'ramp-emp-001': [
        {
          type: 'regular_payroll',
          payment_method: 'direct_deposit',
          total_hours: 80,
          gross_pay: { amount: 4230.77, currency: 'USD' },
          net_pay: { amount: 3200.00, currency: 'USD' },
          earnings: [
            { type: 'salary', hours: 80, amount: 4230.77 }
          ],
          deductions: [
            { name: 'Federal Tax', amount: 900.00 },
            { name: 'State Tax', amount: 130.77 }
          ],
          pay_date: '2024-01-15',
          start_date: '2024-01-01',
          end_date: '2024-01-15'
        }
      ]
    },
    deductions: {
      'ramp-emp-001': {
        deductions: [
          {
            benefit_id: 'ramp-401k-001',
            benefit_name: '401(k) Plan',
            benefit_type: '401k',
            individual_id: 'ramp-emp-001',
            deduction: {
              type: '401k',
              contribution_amount: { amount: 400.00, currency: 'USD' },
              contribution_percentage: 9.46
            }
          }
        ],
        eligibility: {
          is_eligible: true,
          days_since_start: 340,
          days_until_eligible: 0,
          start_date: '2023-02-10'
        },
        retirement_401k: {
          benefit_available: true,
          enrolled: true,
          benefit_id: 'ramp-401k-001',
          benefit_type: '401k'
        }
      }
    }
  },
  'deel': {
    company: {
      id: 'deel-001',
      legal_name: 'Deel Global Solutions LLC',
      name: 'Deel',
      primary_email: 'info@deel.com',
      primary_phone_number: '+1 (555) 300-0003',
      ein: '11-2233445',
      entity: {
        type: 'llc',
        subtype: 'single_member'
      },
      locations: [
        {
          line1: '300 Tech Boulevard',
          line2: 'Building C',
          city: 'Austin',
          state: 'TX',
          postal_code: '78701',
          country: 'USA'
        }
      ],
      accounts: [
        {
          account_name: 'Deel Main Account',
          account_number: '****9012',
          account_type: 'checking',
          routing_number: '****3456'
        }
      ],
      departments: [
        { name: 'Engineering', parent: null },
        { name: 'HR', parent: null },
        { name: 'Legal', parent: null }
      ]
    },
    employees: [
      {
        id: 'deel-emp-001',
        first_name: 'Maria',
        last_name: 'Garcia',
        middle_name: 'Isabel',
        manager: { id: 'deel-emp-002' },
        department: { name: 'Engineering' },
        is_active: true
      },
      {
        id: 'deel-emp-002',
        first_name: 'James',
        last_name: 'Anderson',
        middle_name: 'Patrick',
        manager: null,
        department: { name: 'Engineering' },
        is_active: true
      },
      {
        id: 'deel-emp-003',
        first_name: 'Lisa',
        last_name: 'Thompson',
        middle_name: null,
        manager: { id: 'deel-emp-002' },
        department: { name: 'HR' },
        is_active: true
      }
    ],
    employeeDetails: {
      'deel-emp-001': {
        individual: {
          first_name: 'Maria',
          last_name: 'Garcia',
          email: 'maria.garcia@deel.com'
        },
        employment: {
          id: 'deel-emp-001',
          first_name: 'Maria',
          last_name: 'Garcia',
          middle_name: 'Isabel',
          title: 'Software Engineer',
          department: { name: 'Engineering' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: { id: 'deel-emp-002' },
          start_date: '2023-04-05',
          is_active: true,
          location: {
            line1: '300 Tech Boulevard',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            country: 'USA'
          },
          income: {
            amount: 135000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      },
      'deel-emp-002': {
        individual: {
          first_name: 'James',
          last_name: 'Anderson',
          email: 'james.anderson@deel.com'
        },
        employment: {
          id: 'deel-emp-002',
          first_name: 'James',
          last_name: 'Anderson',
          middle_name: 'Patrick',
          title: 'Engineering Lead',
          department: { name: 'Engineering' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: null,
          start_date: '2022-03-12',
          is_active: true,
          location: {
            line1: '300 Tech Boulevard',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            country: 'USA'
          },
          income: {
            amount: 175000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      },
      'deel-emp-003': {
        individual: {
          first_name: 'Lisa',
          last_name: 'Thompson',
          email: 'lisa.thompson@deel.com'
        },
        employment: {
          id: 'deel-emp-003',
          first_name: 'Lisa',
          last_name: 'Thompson',
          middle_name: null,
          title: 'HR Manager',
          department: { name: 'HR' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: { id: 'deel-emp-002' },
          start_date: '2023-07-18',
          is_active: true,
          location: {
            line1: '300 Tech Boulevard',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            country: 'USA'
          },
          income: {
            amount: 115000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      }
    },
    payStatements: {
      'deel-emp-001': [
        {
          type: 'regular_payroll',
          payment_method: 'direct_deposit',
          total_hours: 80,
          gross_pay: { amount: 5192.31, currency: 'USD' },
          net_pay: { amount: 3900.00, currency: 'USD' },
          earnings: [
            { type: 'salary', hours: 80, amount: 5192.31 }
          ],
          deductions: [
            { name: 'Federal Tax', amount: 1100.00 },
            { name: 'State Tax', amount: 192.31 }
          ],
          pay_date: '2024-01-15',
          start_date: '2024-01-01',
          end_date: '2024-01-15'
        }
      ]
    },
    deductions: {
      'deel-emp-001': {
        deductions: [
          {
            benefit_id: 'deel-401k-001',
            benefit_name: '401(k) Retirement',
            benefit_type: '401k',
            individual_id: 'deel-emp-001',
            deduction: {
              type: '401k',
              contribution_amount: { amount: 450.00, currency: 'USD' },
              contribution_percentage: 8.67
            }
          },
          {
            benefit_id: 'deel-dental-001',
            benefit_name: 'Dental Insurance',
            benefit_type: 'dental_insurance',
            individual_id: 'deel-emp-001',
            deduction: {
              type: 'dental_insurance',
              coverage_level: 'family',
              deduction_amount: { amount: 75.00, currency: 'USD' }
            }
          }
        ],
        eligibility: {
          is_eligible: true,
          days_since_start: 285,
          days_until_eligible: 0,
          start_date: '2023-04-05'
        },
        retirement_401k: {
          benefit_available: true,
          enrolled: true,
          benefit_id: 'deel-401k-001',
          benefit_type: '401k'
        }
      }
    }
  },
  'ubiquity': {
    company: {
      id: 'ubiquity-001',
      legal_name: 'Ubiquity Retirement Services Inc.',
      name: 'Ubiquity',
      primary_email: 'contact@ubiquity.com',
      primary_phone_number: '+1 (555) 400-0004',
      ein: '55-6677889',
      entity: {
        type: 'corporation',
        subtype: 's_corp'
      },
      locations: [
        {
          line1: '400 Retirement Way',
          line2: 'Suite 500',
          city: 'Boston',
          state: 'MA',
          postal_code: '02101',
          country: 'USA'
        }
      ],
      accounts: [
        {
          account_name: 'Ubiquity Operating',
          account_number: '****3456',
          account_type: 'checking',
          routing_number: '****7890'
        }
      ],
      departments: [
        { name: 'Client Services', parent: null },
        { name: 'Compliance', parent: null },
        { name: 'Technology', parent: null }
      ]
    },
    employees: [
      {
        id: 'ubiquity-emp-001',
        first_name: 'Christopher',
        last_name: 'Lee',
        middle_name: 'Min',
        manager: { id: 'ubiquity-emp-002' },
        department: { name: 'Client Services' },
        is_active: true
      },
      {
        id: 'ubiquity-emp-002',
        first_name: 'Amanda',
        last_name: 'White',
        middle_name: 'Marie',
        manager: null,
        department: { name: 'Client Services' },
        is_active: true
      },
      {
        id: 'ubiquity-emp-003',
        first_name: 'Daniel',
        last_name: 'Harris',
        middle_name: 'Robert',
        manager: { id: 'ubiquity-emp-002' },
        department: { name: 'Compliance' },
        is_active: true
      }
    ],
    employeeDetails: {
      'ubiquity-emp-001': {
        individual: {
          first_name: 'Christopher',
          last_name: 'Lee',
          email: 'christopher.lee@ubiquity.com'
        },
        employment: {
          id: 'ubiquity-emp-001',
          first_name: 'Christopher',
          last_name: 'Lee',
          middle_name: 'Min',
          title: 'Client Success Manager',
          department: { name: 'Client Services' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: { id: 'ubiquity-emp-002' },
          start_date: '2023-06-12',
          is_active: true,
          location: {
            line1: '400 Retirement Way',
            city: 'Boston',
            state: 'MA',
            postal_code: '02101',
            country: 'USA'
          },
          income: {
            amount: 120000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      },
      'ubiquity-emp-002': {
        individual: {
          first_name: 'Amanda',
          last_name: 'White',
          email: 'amanda.white@ubiquity.com'
        },
        employment: {
          id: 'ubiquity-emp-002',
          first_name: 'Amanda',
          last_name: 'White',
          middle_name: 'Marie',
          title: 'Director of Client Services',
          department: { name: 'Client Services' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: null,
          start_date: '2021-11-08',
          is_active: true,
          location: {
            line1: '400 Retirement Way',
            city: 'Boston',
            state: 'MA',
            postal_code: '02101',
            country: 'USA'
          },
          income: {
            amount: 155000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      },
      'ubiquity-emp-003': {
        individual: {
          first_name: 'Daniel',
          last_name: 'Harris',
          email: 'daniel.harris@ubiquity.com'
        },
        employment: {
          id: 'ubiquity-emp-003',
          first_name: 'Daniel',
          last_name: 'Harris',
          middle_name: 'Robert',
          title: 'Compliance Officer',
          department: { name: 'Compliance' },
          employment_type: 'full_time',
          employment_status: 'active',
          manager: { id: 'ubiquity-emp-002' },
          start_date: '2023-09-25',
          is_active: true,
          location: {
            line1: '400 Retirement Way',
            city: 'Boston',
            state: 'MA',
            postal_code: '02101',
            country: 'USA'
          },
          income: {
            amount: 140000,
            currency: 'USD',
            unit: 'yearly'
          }
        }
      }
    },
    payStatements: {
      'ubiquity-emp-001': [
        {
          type: 'regular_payroll',
          payment_method: 'direct_deposit',
          total_hours: 80,
          gross_pay: { amount: 4615.38, currency: 'USD' },
          net_pay: { amount: 3500.00, currency: 'USD' },
          earnings: [
            { type: 'salary', hours: 80, amount: 4615.38 }
          ],
          deductions: [
            { name: 'Federal Tax', amount: 950.00 },
            { name: 'State Tax', amount: 165.38 }
          ],
          pay_date: '2024-01-15',
          start_date: '2024-01-01',
          end_date: '2024-01-15'
        }
      ]
    },
    deductions: {
      'ubiquity-emp-001': {
        deductions: [
          {
            benefit_id: 'ubiquity-401k-001',
            benefit_name: '401(k) Savings Plan',
            benefit_type: '401k',
            individual_id: 'ubiquity-emp-001',
            deduction: {
              type: '401k',
              contribution_amount: { amount: 550.00, currency: 'USD' },
              contribution_percentage: 11.92
            }
          },
          {
            benefit_id: 'ubiquity-health-001',
            benefit_name: 'Health Insurance',
            benefit_type: 'health_insurance',
            individual_id: 'ubiquity-emp-001',
            deduction: {
              type: 'health_insurance',
              coverage_level: 'family',
              deduction_amount: { amount: 200.00, currency: 'USD' }
            }
          },
          {
            benefit_id: 'ubiquity-vision-001',
            benefit_name: 'Vision Insurance',
            benefit_type: 'vision_insurance',
            individual_id: 'ubiquity-emp-001',
            deduction: {
              type: 'vision_insurance',
              coverage_level: 'individual',
              deduction_amount: { amount: 25.00, currency: 'USD' }
            }
          }
        ],
        eligibility: {
          is_eligible: true,
          days_since_start: 217,
          days_until_eligible: 0,
          start_date: '2023-06-12'
        },
        retirement_401k: {
          benefit_available: true,
          enrolled: true,
          benefit_id: 'ubiquity-401k-001',
          benefit_type: '401k'
        }
      }
    }
  }
};

export default fakeData;
