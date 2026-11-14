<script setup lang="ts">
const route = useRoute()
const { data: guide } = await useHelpGuide(() => route.path)
// Affiche la page d'erreur 404 plutôt qu'une page vide
if (!guide.value) throw createError({ statusCode: 404, statusMessage: 'Guide introuvable', fatal: true })

useSeoMeta({ title: guide.value.title, description: guide.value.description })
</script>

<template>
  <div v-if="guide">
    <UButton to="/help" icon="i-lucide-arrow-left" variant="link" color="neutral" size="sm" label="Tous les guides" class="-ml-2.5 mb-4" />
    <article class="guide-prose max-w-3xl">
      <h1>{{ guide.title }}</h1>
      <p v-if="guide.description" class="guide-lead">{{ guide.description }}</p>
      <ContentRenderer :value="guide" />
    </article>
  </div>
</template>
