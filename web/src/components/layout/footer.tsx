export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4">
        <p className="text-center text-sm text-gray-500">
          Desenvolvido por{" "}
          <a
            href="https://iasmin.dev/bv"
            title="Iasmin.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-base transition-colors hover:text-brand-dark hover:underline"
          >
            Iasmin.dev
          </a>
        </p>
      </div>
    </footer>
  );
}
