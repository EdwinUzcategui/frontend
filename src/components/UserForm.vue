<template>
  <v-container class="px-0 mx-5">
      <v-row>
        <v-col cols="4">
            <h1 class="text-center">User form</h1>
            <form>  
                <v-text-field
                    v-model="user.name"
                    :error-messages="nameErrors"
                    :counter="30"
                    label="Name"
                    required
                    @input="$v.user.name.$touch()"
                    @blur="$v.user.name.$touch()"
                ></v-text-field>
                <v-text-field
                    v-model="user.lastname"
                    :error-messages="lastnameErrors"
                    :counter="30"
                    label="Lastname"
                    required
                    @input="$v.user.lastname.$touch()"
                    @blur="$v.user.lastname.$touch()"
                ></v-text-field>

                <v-menu
                    ref="menu"
                    v-model="menu"
                    :close-on-content-click="false"
                    :return-value.sync="user.birth_date"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="user.birth_date"
                            label="Birth date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="user.birth_date"
                        no-title
                        scrollable
                    >
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        color="primary"
                        @click="menu = false"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        text
                        color="primary"
                        @click="$refs.menu.save(user.birth_date)"
                    >
                        OK
                    </v-btn>
                    </v-date-picker>
                </v-menu>

                <v-text-field
                    v-model="user.age"
                    label="Age"
                    readonly
                ></v-text-field> 

                <v-textarea
                    v-if="current_address"
                    v-model="current_address"
                    outlined
                    label="Current address"
                    readonly
                    height="100"
                ></v-textarea>
                <v-btn
                    v-if="current_address"
                    rounded
                    dark
                    color="info"
                    small
                    @click="clearAddress()"
                >
                    Change address
                </v-btn>

                <!--Autocompletado de google-->
                <google-places-autocomplete
                    @resultChanged="placeDetail => getAddressData(placeDetail)"
                    @resultCleared="() => place = null"
                    v-if="!current_address"
                    id="google_places"
                >
                    <div slot="input" slot-scope="{ context, events, actions }">
                        <v-text-field
                            v-model="context.input"
                            @focus="events.inputHasReceivedFocus"
                            @input="events.inputHasChanged"
                            @keydown.enter.prevent="actions.selectItemFromList"
                            @keydown.down.prevent="actions.shiftResultsSelection"
                            @keydown.up.prevent="actions.unshiftResultsSelection"
                            type="search"
                            id="locationInput"
                            placeholder=" "
                            class=""
                            label="Type your address"
                        ></v-text-field>
                    </div>
                </google-places-autocomplete>
                
                <div v-if="map.lat">
                    <GmapMap
                        :center="map"
                        :zoom="15"
                        style="width: 100%; height: 300px; margin: auto"
                        >
                    </GmapMap>
                </div>
                <div class="mt-5">
                    <v-btn
                        color="primary"
                        class="mr-5"
                        @click="storeOrUpdateUser"
                        :loading="loading"
                    >
                        {{ edit ? 'edit' : 'register' }}
                    </v-btn>
                    <v-btn 
                        @click="clear"
                        color="secondary"
                    >
                        clear
                    </v-btn>
                </div>
                
            </form>
        </v-col>

        <v-col cols="8">
          <h1 class="text-center">Users</h1>
            <h5 
                class="text-center"
                v-if="!users.length"
            >
                No registered users
            </h5>
            <v-simple-table
                fixed-header
                height="600px"
                v-if="users.length"
            >
                <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">
                            Name
                        </th>
                        <th class="text-left">
                            Lastname
                        </th>
                        <th class="text-left">
                            Birth date
                        </th>
                        <th class="text-left">
                            Age
                        </th>
                        <th class="text-left">
                            Address
                        </th>
                        <th class="text-left">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <UserItem  
                        v-for="item in users" 
                        :key="item.id" 
                        :user="item" 
                        @getUserDetails="getUserDetails"
                        @deleteUser="deleteUser"
                    />
                </tbody>
                </template>
            </v-simple-table>
        </v-col>
      </v-row>
      
  </v-container>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required, maxLength } from 'vuelidate/lib/validators'

  import Swal from "sweetalert2";

  import { GooglePlacesAutocomplete } from 'vue-better-google-places-autocomplete'

  import UserService from '@/services/user.service'

  import UserItem from '@/components/UserItem'    

  export default {
    components: { GooglePlacesAutocomplete, UserItem },
    mixins: [validationMixin],

    validations: {
        user: {
            name: { required, maxLength: maxLength(30) },
            lastname: { required, maxLength: maxLength(30) },
        }
    },

    data: () => ({
        users: [],
        user: {
            name: '',
            lastname: '',
            birth_date: '',
            age: '',
            address: {
                street: '',
                no_outside: '',
                colony: '',
                zip: '',
                city: '',
                country: '',
                latitude: '',
                longitude: '',
            },
        },
        map: {
            lat: 10.48,
            lng: -66.90,
        },
        current_address: '',
        edit: false,
        menu: false,
        loading: false,
        loading_delete: false,
    }),
    watch: {
        birthDate(newVal) {
            if (newVal != '') {
                this.calculateAge(newVal)
            }
        }
    },
    created() {
        this.getUsers();
    },
    computed: {
        birthDate() {
            return this.user.birth_date;
        },
        nameErrors() {
            const errors = []
            if (!this.$v.user.name.$dirty) return errors
            !this.$v.user.name.maxLength && errors.push('Name must be at most 30 characters long')
            !this.$v.user.name.required && errors.push('Name is required.')
            return errors
        },
        lastnameErrors() {
            const errors = []
            if (!this.$v.user.lastname.$dirty) return errors
            !this.$v.user.lastname.maxLength && errors.push('Name must be at most 30 characters long')
            !this.$v.user.lastname.required && errors.push('Lastname is required')
            return errors
        },
    },
    methods: {
        async getUserDetails(id) {   
            try {
                this.loading = true

                const { data:res } = await UserService.getUserDetails(id)

                this.user = res.data

                this.current_address = res.data.address.full_address

                this.map.lat = parseFloat(res.data.address.latitude)
                this.map.lng = parseFloat(res.data.address.longitude)

                this.edit = true

            } catch (error) {
                this.loading = false
                return this.$swal({
                    title: "Lo sentimos...",
                    text: error,
                    icon: "error",
                });
            }

            this.loading = false
        },
        async getUsers() {   
            try {
                this.loading = true

                const { data:res } = await UserService.getUsers()

                this.users = res.data

            } catch (error) {
                this.loading = false
                return Swal.fire({
                    title: "Lo sentimos...",
                    text: error,
                    icon: "error",
                });
            }

            this.loading = false
        },
        async storeOrUpdateUser() {
            this.$v.$touch();

            if (this.user.birth_date == '') {
                return Swal.fire({
                    title: "Lo sentimos...",
                    text: "Debe ingresar la fecha de nacimiento",
                    icon: "warning",
                });
            }

            if (this.user.address.latitude == '') {
                return Swal.fire({
                    title: "Lo sentimos...",
                    text: "Debe ingresar su dirección",
                    icon: "warning",
                });
            }

            if (this.$v.$invalid) {
                return;
            } 
            
            if (!this.edit) {
                try {
                    this.loading = true

                    const { data:res } = await UserService.storeUser(this.user)

                    this.users.push(res.data)

                    if (res.success) {
                        Swal.fire({
                            title: res.message,
                            icon: "success",
                        });
                    }

                } catch (error) {
                    this.loading = false

                    return Swal.fire({
                        title: "Lo sentimos...",
                        text: error,
                        icon: "error",
                    });
                }

                this.clear();

            } else {
                try {
                    this.loading = true

                    const { data:res } = await UserService.updateUser(this.user)

                    if (res.success) {
                        Swal.fire({
                            title: res.message,
                            icon: "success",
                        });
                    } 
                    
                    this.getUsers()

                } catch (error) {
                    this.loading = false
                    
                    return Swal.fire({
                        title: "Lo sentimos...",
                        text: error,
                        icon: "error",
                    });
                }

                this.edit = false

                this.clear();
            }

            this.loading = false
        },
        async deleteUser(id) {
            const canDelete = await Swal.fire({
				title: "¿Seguro de eliminar el usuario?",
				text: "",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#34c38f",
				cancelButtonColor: "#f46a6a",
				confirmButtonText: "Si, continuar!",
                cancelButtonText: "Cancelar"
			})
            if(canDelete.isConfirmed) {
                try {
                    this.loading_delete = true

                    const { data:res } = await UserService.deleteUser({id: id})

                    if (res.success) {
                        Swal.fire({
                            title: res.message,
                            icon: "success",
                        });
                    }

                    this.getUsers();

                } catch (error) {
                    this.loading_delete = false

                    return Swal.fire({
                        title: "Lo sentimos...",
                        text: error,
                        icon: "error",
                    });
                }
            }   
            
            this.loading_delete = false
        },
        calculateAge(date) {
            if (date == ''){
                this.user.age = null
            }

            var today = new Date();
            var birthDate = new Date(date);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();

            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            this.user.age = age
        },
        clear() {
            this.$v.$reset()
            this.user = {
                name: '',
                lastname: '',
                birth_date: '',
                age: null,
                address: {
                    street: '',
                    no_outside: '',
                    colony: '',
                    zip: '',
                    city: '',
                    country: '',
                    latitude: '',
                    longitude: '',
                },
            }

            this.map = {
                lat: '',
                lng: '',
            }

            if (this.current_address !== '') {
                this.current_address = ''
            } else {
                let locationInput = document.getElementById('locationInput');
                locationInput.value = ''    
                
            }
          
            this.edit = false
        },
        clearAddress() {
            this.user.address = {
                street: '',
                no_outside: '',
                colony: '',
                zip: '',
                city: '',
                country: '',
                latitude: '',
                longitude: '',
            }

            this.map = {
                lat: '',
                lng: '',
            }

            if (this.current_address !== '') {
                this.current_address = ''
            } else {
                let locationInput = document.getElementById('locationInput');
                locationInput.value = ''
            }
        },
        getAddressData(addressData) {
            addressData.address_components.forEach(i => {
                if (i.types.length) {
                    if (i.types.indexOf('country') > -1) {
                        this.user.address.country = i.long_name
                    }
                    if (i.types.indexOf('postal_code') > -1) {
                        this.user.address.zip = i.long_name
                    }
                    if (i.types.indexOf('locality') > -1) {
                        this.user.address.city = i.long_name
                    }
                    if (i.types.indexOf('street_number') > -1) {
                        this.user.address.no_outside = i.long_name
                    }
                    if (i.types.indexOf('route') > -1) {
                        this.user.address.street = i.long_name
                    }
                    if (i.types.indexOf('sublocality_level_1') > -1) {
                        this.user.address.colony = i.long_name
                    }
                }
            })
            this.map.lat = addressData.geometry.location.lat()
            this.map.lng = addressData.geometry.location.lng()

            this.user.address.latitude = addressData.geometry.location.lat()
            this.user.address.longitude = addressData.geometry.location.lng()
        }
    },
  }
</script>