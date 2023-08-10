<template>
  <div>
    Nuxt module playground!
    <button @click="load">
      Load
    </button>
  </div>
  <pre>{{ users }}</pre>
</template>

<script setup lang="ts">
import { createLazyton } from '@privyid/nuapi/core'
import { onMounted, ref } from '#imports'

const users  = ref([])
const useApi = createLazyton({ prefixURL: '/api/example' })

function load () {
  users.value = []

  useApi().get('/users')
    .then((response) => {
      users.value = response.data
    })
}

onMounted(() => {
  load()
})
</script>
