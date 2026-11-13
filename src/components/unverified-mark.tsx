/** Dagger after an entry whose `verified` flag is false. Pair it with <UnverifiedNote /> once per page or table. */
export function UnverifiedMark() {
  return (
    <sup>
      <span className="sr-only"> (not yet confirmed against a source)</span>
      <span aria-hidden> †</span>
    </sup>
  );
}

export function UnverifiedNote() {
  return <p className="mt-2 text-xs text-muted-foreground">† Not yet confirmed against a source.</p>;
}
