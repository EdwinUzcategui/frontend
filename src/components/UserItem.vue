<template>
    <tr>
        <td>{{ user.name }}</td>
        <td>{{ user.lastname }}</td>
        <td>{{ user.birth_date }}</td>
        <td>{{ user.age }}</td>
        <td>{{ user.address.full_address}}</td>
        <td>   
            <v-row>
                <v-btn
                    fab
                    dark
                    small
                    color="info"
                    :loading="loading_detail"
                    @click="getUserDetails(user.id)"
                >
                    <v-icon dark>
                        mdi-account-edit
                    </v-icon>
                </v-btn>
                <v-btn
                    fab
                    dark
                    small
                    color="error"
                    :loading="loading_delete"
                    @click="deleteUser(user.id)"
                >
                    <v-icon dark>
                        mdi-trash-can
                    </v-icon>
                </v-btn>
            </v-row>   
        </td>
    </tr>
</template>

<script>
export default {
    props: ['user'],
    data() {
        return {
            loading_delete: false,
            loading_detail: false,
        }
    },
    methods: {
        getUserDetails(id) {
            this.loading_detail = true
            this.$emit('getUserDetails', id)
            this.loading_detail = false
        },
        deleteUser(id) {
            this.loading_delete = true
            this.$emit('deleteUser', id)
            this.loading_delete = false
        }
    }
}
</script>