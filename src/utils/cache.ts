export async function preloadFBX(urls: string[]) {
  await Promise.allSettled(
    urls.map(url => {
      fetch(url, { cache: "force-cache" }).then(res => res.arrayBuffer());
    }),
  );
}
