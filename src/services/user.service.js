import api from '@/api'

class UserService {

  static getUsers() {
    return api({
      url: 'users',
      method: 'get'
    })
  }

  static storeUser(data) {
    return api({
      url: 'users',
      data: data,
      method: 'post'
    })
  }  

  static deleteUser(data) {
		return api({
			url: 'users',
			data,
			method: 'delete'
		})
	}

  static getUserDetails(id) {
		return api({
			url: `user-detail/${id}`
		})
	}

  static updateUser(data) {
		return api({
			url: 'users',
			data,
			method: 'put'
		})
	}


}

export default UserService
