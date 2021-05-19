import React, { useState } from "react";
import { TextInput } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { useOfflineMutation } from "~extensions/useOfflineMutation";
import GET_POSTS from '~graphqls/queries/Post/getLatestPosts'
import INSERT_POST from "~graphqls/mutations/Post/insertPost";
import { StyleSheet } from 'react-native';

import EditScreenInfo from '~components/EditScreenInfo';
import { Text, View } from '~components/Themed';

export default function NewPostScreen() {
  const [addPost] = useOfflineMutation(INSERT_POST, {
    offlineUpdate: [
      {
        query: GET_POSTS,
        updateQuery: (data, variables) => ({
          posts: [
            ...(data?.posts || []),
            {
              __typename: "posts",
              id: `optimistic-${uuidv4()}`,
              text: variables?.text,
            },
          ],
        }),
      },
    ],
    offlineReturn: {
      createResponse: (variables) => {
        return {
          data: {
            insert_posts: {
              affected_rows: 1,
              __typename: "posts_mutation_response",
            },
          },
          variables,
        };
      },
      statusSubscribe: (fetchResult, error) =>
        !error
          ? console.log("DONE SUBMITTING UPDATE!", fetchResult)
          : console.error(error),
    },
  });
  const [text, setText] = useState("");

  const onSubmit = async () => {
    var response = await addPost({
      variables: { text },
    });
    console.log("OPTIMISTIC RESPONSE!", response);
    setText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Post</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        placeholder="Search"
        onSubmitEditing={onSubmit}
        onChangeText={setText}
        value={text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
