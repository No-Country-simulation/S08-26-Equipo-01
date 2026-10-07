UPDATE users
SET first_name = initcap(lower(regexp_replace(btrim(first_name), '[[:space:]]+', ' ', 'g'))),
    last_name = initcap(lower(regexp_replace(btrim(last_name), '[[:space:]]+', ' ', 'g')))
WHERE first_name IS NOT NULL
  AND last_name IS NOT NULL;
