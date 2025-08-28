import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import styles from '@/assets/styles/home.styles';
import { Image } from 'expo-image';
import BASE_URL from '@/constants/url';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';
import { formatPublishDate } from '@/lib/utils';
import Loader from '@/components/Loader';



export default function Home() {

  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true)

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    // Don't fetch if we don't have a valid token
    if (!token) {
      console.log("No token available, skipping fetch");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      const response = await fetch(`${BASE_URL}/api/books?page=${pageNum}&limit=5`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch books');
      }


      let uniqueBooks;
      if (refresh || pageNum === 1) {
        uniqueBooks = data.books;
      } else {
        const allBooks = [...books, ...data.books];
        const seenIds = new Set();
        uniqueBooks = allBooks.filter(book => {
          if (seenIds.has(book._id)) {
            return false;
          }
          seenIds.add(book._id);
          return true;
        });
      }

      setBooks(uniqueBooks)

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);


    } catch (error) {
      console.log("Error fetching books", error);

    } finally {
      if (refresh) {
        
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }

  }

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  }

  type Book = {
    _id: string;
    title: string;
    caption: string;
    rating: number;
    createdAt: string;
    user: {
      profileImage: string;
      username: string;
    };
    image: string;
  };


  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      )
    }
    return stars;
  }

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}> {item.user.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>

        <Image source={item.image} style={styles.bookImage} contentFit='cover' />
      </View>
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>

      </View>
    </View>
  )



  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [token])

  if (loading) return <Loader />

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { fetchBooks(1, true) }}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm</Text>
            <Text style={styles.headerSubtitle}>Discover great reads from the community</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='book-outline' size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No books shared yet. </Text>
            <Text style={styles.emptySubtext}>Be the first to share one!</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size='small' color={COLORS.primary} />
          ) : null
        }
      />


    </View>
  )
}