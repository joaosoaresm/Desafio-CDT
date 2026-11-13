// Formato de um usuário retornado por https://jsonplaceholder.typicode.com/users
// Campos usados no desafio: id, name, email, phone, address.city e company.name.
export type User = {
  id: number
  name: string
  email: string
  phone: string
  address: {
    city: string
  }
  company: {
    name: string
  }
}
