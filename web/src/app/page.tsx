import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Author Catalog Tracker
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Your central hub for managing authors, books, and eBooks. Track
          publications, distributors, and catalog your entire library in one place.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/authors"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
          >
            Browse Authors
          </Link>
          <Link
            href="/books"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            View Books
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 sm:grid-cols-3 py-16">
        <FeatureCard
          title="Authors"
          description="Manage author profiles with bios, pen names, and contact information."
          icon="✍️"
          href="/authors"
        />
        <FeatureCard
          title="Books & eBooks"
          description="Track physical and digital publications with ISBNs, formats, and metadata."
          icon="📚"
          href="/books"
        />
        <FeatureCard
          title="Distributors"
          description="Keep a directory of distributors and link them to your catalog."
          icon="🏢"
          href="/distributors"
        />
        <FeatureCard
          title="Organizations"
          description="Track organizations for book promotion outreach — schools, clubs, and more."
          icon="🤝"
          href="/organizations"
        />
        <FeatureCard
          title="Distributions"
          description="See which distributors carry each book, filtered by author."
          icon="📦"
          href="/distributions"
        />
        <FeatureCard
          title="Outreach"
          description="Log contacts with organizations — track who you sent books to and how it went."
          icon="📨"
          href="/outreach"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="text-3xl mb-3" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      {content}
    </div>
  );
}
