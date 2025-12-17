const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Delete existing data
  await knex('audit_logs').del();
  await knex('tracking_locations').del();
  await knex('sync_queue').del();
  await knex('visits').del();
  await knex('dealers').del();
  await knex('users').del();
  await knex('territories').del();

  // Insert territories
  const territoryIds = await knex('territories').insert([
    {
      name: 'North Region',
      description: 'Northern region covering major aquaculture farms',
      is_active: true
    },
    {
      name: 'South Region',
      description: 'Southern region with diverse farming operations',
      is_active: true
    },
    {
      name: 'East Region',
      description: 'Eastern coastal region',
      is_active: true
    }
  ]);
  const [northTerritoryId, southTerritoryId, eastTerritoryId] = territoryIds;

  // Insert users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const userIds = await knex('users').insert([
    {
      first_name: 'Admin',
      last_name: 'User',
      email: 'patanmusthakheem456@gmail.com',
      password_hash: passwordHash,
      role: 'super_admin',
      is_active: true
    },
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@aquaculture.com',
      password_hash: passwordHash,
      role: 'manager',
      territory_id: northTerritoryId,
      is_active: true
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@aquaculture.com',
      password_hash: passwordHash,
      role: 'rep',
      territory_id: southTerritoryId,
      is_active: true
    },
    {
      first_name: 'Mike',
      last_name: 'Brown',
      email: 'mike.brown@aquaculture.com',
      password_hash: passwordHash,
      role: 'rep',
      territory_id: eastTerritoryId,
      is_active: true
    }
  ]);
  const [adminId, managerId, rep1Id, rep2Id] = userIds;

  // Insert dealers
  const dealerIds = await knex('dealers').insert([
    {
      name: 'ABC Farm',
      phone: '+1 (555) 123-4567',
      email: 'abc.farm@example.com',
      address: '123 Farm Road, City, State 12345',
      latitude: 40.7128,
      longitude: -74.0060,
      farm_size: 25,
      species: 'tilapia',
      territory_id: northTerritoryId,
      notes: 'Regular dealer with consistent orders. Prefers morning visits.'
    },
    {
      name: 'XYZ Aquaculture',
      phone: '+1 (555) 987-6543',
      email: 'xyz@example.com',
      address: '456 Lake Street, City, State 12345',
      latitude: 34.0522,
      longitude: -118.2437,
      farm_size: 45,
      species: 'catfish',
      territory_id: southTerritoryId,
      notes: 'Large operation, requires regular monitoring.'
    },
    {
      name: 'Coastal Fisheries',
      phone: '+1 (555) 555-5555',
      email: 'coastal@example.com',
      address: '789 Ocean Drive, City, State 12345',
      latitude: 29.7604,
      longitude: -95.3698,
      farm_size: 60,
      species: 'salmon',
      territory_id: eastTerritoryId,
      notes: 'Premium quality producer.'
    }
  ]);
  const [dealer1Id, dealer2Id, dealer3Id] = dealerIds;

  // Insert visits
  await knex('visits').insert([
    {
      dealer_id: dealer1Id,
      rep_id: managerId,
      visit_type: 'demo',
      start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000), // 1h 15m later
      start_latitude: 40.7128,
      start_longitude: -74.0060,
      end_latitude: 40.7128,
      end_longitude: -74.0060,
      notes: 'Conducted product demonstration for new feeding system. Dealer showed interest.',
      is_synced: true
    },
    {
      dealer_id: dealer2Id,
      rep_id: rep1Id,
      visit_type: 'sale',
      start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1h 30m later
      start_latitude: 34.0522,
      start_longitude: -118.2437,
      end_latitude: 34.0522,
      end_longitude: -118.2437,
      notes: 'Successful sale visit. Order placed.',
      is_synced: true
    }
  ]);
};

