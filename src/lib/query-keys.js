/** Fábrica de query keys. Las listas no llevan filtros: se descargan completas y se filtran en cliente. */
export const qk = {
  auth: {
    session: ['auth', 'session'],
  },
  users: {
    all: ['users'],
    list: () => ['users', 'list'],
    stats: () => ['users', 'stats'],
    detail: (id) => ['users', 'detail', id],
  },
  licenses: {
    all: ['licenses'],
    list: () => ['licenses', 'list'],
    stats: () => ['licenses', 'stats'],
    detail: (id) => ['licenses', 'detail', id],
  },
  atc: {
    all: ['atc'],
    list: () => ['atc', 'list'],
    detail: (id) => ['atc', 'detail', id],
  },
  usage: {
    all: ['usage'],
    list: () => ['usage', 'list'],
    detail: (deviceId) => ['usage', 'detail', deviceId],
  },
  contacts: {
    all: ['contacts'],
    list: () => ['contacts', 'list'],
    detail: (id) => ['contacts', 'detail', id],
  },
}
