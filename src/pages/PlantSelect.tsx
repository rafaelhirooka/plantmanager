import React, { useCallback, useEffect, useState } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import colors from '../styles/colors';
import { Header } from '../components/Header';
import fonts from '../styles/fonts';
import { EnviromentButton } from '../components/EnviromentButton';
import api from '../services/api';
import { PlantCardPrimary } from '../components/PlantCardPrimary';
import { Load } from '../components/Load';

interface EnviromentProps {
  key: string;
  title: string;
}

interface PlantProps {
  id: string;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: string[];
  frequency: {
    times: number;
    repeat_every: string
  }
}

export function PlantSelect() {
  const [enviroments, setEnviroments] = useState<EnviromentProps[]>([]);
  const [plants, setPlants] = useState<PlantProps[]>([]);
  const [enviromentSelected, setEnviromentSelected] = useState('all');
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);
  
  const handleEnviromentSeleted = useCallback((key: string) => {
    setEnviromentSelected(key);
  }, []);

  const fetchPlant = useCallback(async () => {
    const { data } = await api
    .get<PlantProps[]>(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

    if (!data)
      return setLoadedAll(true);
    
    if (page > 1) {
      setPlants(state => [
        ...state,
        ...data
      ]);
    } else {
      setPlants(data);
    }
    
    setLoading(false);
    setLoadingMore(false);
  }, [page]);

  const handleFetchMore= useCallback((distance: number) => {
    if (distance < 1)
      return;
    
    setLoadingMore(true);
    setPage(state => state + 1);
  }, []);

  useEffect(() => {
    async function fetchEnviroment() {
      const { data } = await api.get<EnviromentProps[]>('plants_environments?_sort=title&_order=asc');

      setEnviroments([
        {
          key: 'all',
          title: 'Todos',
        },
        ...data
      ]);
    }

    fetchEnviroment();
  }, []);

  useEffect(() => {
    fetchPlant();
  }, [fetchPlant]);

  useEffect(() => {
    if (enviromentSelected === 'all')
      return setFilteredPlants(plants);

    const filtered = plants.filter(plant => (
      plant.environments.includes(enviromentSelected)
    ));

    setFilteredPlants(filtered);
  }, [enviromentSelected, plants]);

  if (loading) return <Load />
  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Header />

        <Text style={styles.title}>
          Em qual ambiente
        </Text>
        <Text style={styles.subtitle}>
          você quer colocar sua planta?
        </Text>
      </View>

      <View>
        <FlatList
          data={enviroments}
          renderItem={({ item }) => (
            <EnviromentButton 
              key={item.key} 
              title={item.title} 
              active={enviromentSelected === item.key}
              onPress={() => handleEnviromentSeleted(item.key)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.enviromentList}
        />
      </View>

      <View style={styles.plants}>
        <FlatList
          data={filteredPlants}
          renderItem={({ item }) => (
            <PlantCardPrimary key={item.id} data={item} />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          onEndReachedThreshold={0.1}
          onEndReached={({ distanceFromEnd }) => !loadedAll && handleFetchMore(distanceFromEnd)}
          ListFooterComponent={
            loadingMore ?
            <ActivityIndicator color={colors.green} /> :
            <></>
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 30
  },
  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading
  },
  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading
  },
  enviromentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    paddingHorizontal: 32,
    marginVertical: 32
  },
  plants: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
});