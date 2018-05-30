// collection = []
// document = {}

// [], [], [{}, {}, {}]

const users = [
  {name: 'Ivan', surname: 'Ivanov'},
  {name: 'Petr', surname: 'Ivanov'},
  {name: 'Alexandr', surname: 'Ivanov'},
];

// {name: 'Alexandr', surname: 'Ivanov'}
// users.find(user => user.name === 'Alexandr');

const usersByName = {
  Alexandr-Moscow: users[2],
  Petr: users[1],
  Ivan: users[0]
};

// usersByName['Alexandr']

// usersByNameAndCity['Alexandr-Moscow']
