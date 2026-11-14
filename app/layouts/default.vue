<template>
  <div class="flex min-h-dvh bg-default">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-default focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg focus:ring-2 focus:ring-primary">
      Aller au contenu
    </a>
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppMobileBar />
      <main id="main" class="flex-1">
        <UContainer class="py-6 sm:py-8">
          <slot />
        </UContainer>
      </main>
    </div>
  </div>
</template>
