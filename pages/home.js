import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useQuery, gql } from "@apollo/client";
import SearchBar from "../components/searchBar/searchBar";
import CharacterList from "../components/characterList/characterList";
import React, { useState } from "react";

var isSearch = false;
// var current_filter = null;
var my_filter = "";
// console.log("top");
export default function Home() {
  // console.log("home");
  const Characters_data = gql`
    query CharactersQuery($page: Int, $filter: FilterCharacter) {
      characters(page: $page, filter: $filter) {
        info {
          prev
          next
        }
        results {
          id
          name
          image
        }
      }
    }
  `;

  const { loading, error, data, fetchMore } = useQuery(Characters_data, {
    variables: { page: 1, filter: {} },
    errorPolicy: "ignore",
  });
  //   current_filter = useState()[0];
  const [current_filter, setFilter] = useState(isSearch ? my_filter : null);
  //   if (isSearch) setFilter(my_filter);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  function loadMore(isSearch, my_filter) {
    const nextPage = data.characters.info.next;
    var variables = { page: nextPage, filter: {} };
    if (isSearch) {
      variables = { page: nextPage, filter: { name: my_filter } };
    }

    fetchMore({
      variables: variables,

      updateQuery: (prevResult, { fetchMoreResult }) => {
        fetchMoreResult.characters.results = [
          ...prevResult.characters.results,
          ...fetchMoreResult.characters.results,
        ];
        return fetchMoreResult;
      },
    });
  }

  function search(event) {
    event.preventDefault();
    isSearch = true;
    setFilter(event.target[0].value);
    my_filter = event.target[0].value;
    // event.target[0].value = "";
    // console.log(isSearch);

    fetchMore({
      variables: { page: null, filter: { name: my_filter } },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        // console.log("came here");
        return fetchMoreResult;
      },
    });
  }
  // console.log(data);

  const results = data.characters ? data.characters.results : [];
  const info = data.characters
    ? data.characters.info
    : { prev: null, next: null };

  console.log(isSearch, current_filter);

  return (
    <>
      <Head>
        <title>Rick and Morty</title>
      </Head>
      <h1>Rick and Morty</h1>
      <SearchBar search={(event) => search(event)} value={current_filter} />
      {isSearch ? (
        <div className={styles.loadMore}>
          <button
            onClick={() => {
              isSearch = false;
              setFilter(null);
              my_filter = null;
              fetchMore({
                variables: { page: 1, filter: {} },
                updateQuery: (prevResult, { fetchMoreResult }) => {
                  return fetchMoreResult;
                },
              });
            }}
            className={styles.loadButton}
          >
            Back To All Characters
          </button>
        </div>
      ) : null}
      <CharacterList characters={results} />
      <div className={styles.loadMore}>
        {info.next ? (
          <button
            onClick={() => loadMore(isSearch, my_filter)}
            className={styles.loadButton}
          >
            Load More
          </button>
        ) : null}
      </div>
    </>
  );
}
