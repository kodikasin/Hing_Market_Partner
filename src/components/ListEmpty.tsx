import { StyleSheet, Text } from 'react-native'
import React from 'react'

export const ListEmpty = () => {
  return (
    <Text style={styles.listEmptyComponent}>
               No orders yet
             </Text>
  )
}

const styles = StyleSheet.create({
   listEmptyComponent:{ textAlign: 'center', marginTop: 20 }
})
