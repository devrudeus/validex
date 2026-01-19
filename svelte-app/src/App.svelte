<script>
  import Hero from './Hero.svelte'
  import Features from './Features.svelte'
  import Footer from './Footer.svelte'
</script>

<main>
  <Hero />
  <Features />
  <Footer />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    overflow-x: hidden;
  }

  main {
    min-height: 100vh;
    width: 100%;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }
</style>
