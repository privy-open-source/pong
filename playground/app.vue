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
import { useApi } from '@privyid/nuapi/core'
import { onMounted, ref } from '#imports'

const users = ref([])

function load () {
  users.value = []

  useApi().get('/api/example/users')
    .then((response) => {
      users.value = response.data
    })
}

onMounted(() => {
  load()
})
</script>
