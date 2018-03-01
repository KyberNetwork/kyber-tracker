var bcrypt = require('bcryptjs');

const seeds = [
  {
    id: 1, username: 'admin',
    email: 'test@gmail.com',
    avatar_url: 'images/Chubby-Choboco.jpg',
    password: bcrypt.hashSync('1', bcrypt.genSaltSync(8)),
    full_name: 'Super User',
  }
];

exports.seed = function (knex, Promise) {
  return Promise.join(
    knex('user').truncate(),
    knex('user').insert(seeds),
    knex.raw('ALTER TABLE user AUTO_INCREMENT=1000001')
  )
};
