import { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: string[];
  initialIndex?: number;
}

export default function ProductImageGallery({ images, initialIndex = 0 }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleThumbnailPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

  const handleImagePress = (index: number) => {
    setZoomedImageIndex(index);
    setZoomModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={initialIndex}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}>
        {images.map((imageUri, index) => (
          <View key={index} style={styles.page}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleImagePress(index)}
              style={styles.imageWrap}>
              <Image source={{ uri: imageUri }} style={styles.mainImage} resizeMode="cover" />
            </TouchableOpacity>
          </View>
        ))}
      </PagerView>

      {/* Page indicators */}
      <View style={styles.indicators}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[styles.indicator, index === activeIndex && styles.activeIndicator]}
          />
        ))}
      </View>

      {/* Thumbnail gallery */}
      <View style={styles.thumbnailSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailScroll}>
          {images.map((imageUri, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleThumbnailPress(index)}
              style={[
                styles.thumbnail,
                index === activeIndex && styles.thumbnailActive,
              ]}
              activeOpacity={0.7}>
              <Image source={{ uri: imageUri }} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Zoom Modal */}
      <Modal
        visible={zoomModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomModalVisible(false)}>
        <ZoomableImageModal
          images={images}
          initialIndex={zoomedImageIndex}
          onClose={() => setZoomModalVisible(false)}
        />
      </Modal>
    </View>
  );
}

function ZoomableImageModal({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <X size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <PagerView
          style={styles.modalPager}
          initialPage={initialIndex}
          onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}>
          {images.map((imageUri, index) => (
            <View key={index} style={styles.modalPage}>
              <ScrollView
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.zoomScrollContent}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </ScrollView>
            </View>
          ))}
        </PagerView>

        <View style={styles.modalIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.modalIndicator,
                index === currentIndex && styles.modalIndicatorActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  pagerView: {
    width: '100%',
    height: 360,
  },
  page: {
    width: '100%',
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  indicators: {
    position: 'absolute',
    bottom: 76,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#DC2626',
  },
  thumbnailSection: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  thumbnailScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#DC2626',
    borderWidth: 2.5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalPager: {
    flex: 1,
  },
  modalPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.7,
  },
  modalIndicators: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalIndicatorActive: {
    width: 24,
    backgroundColor: '#DC2626',
  },
});
