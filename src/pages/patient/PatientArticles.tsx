import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  Heart, 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Activity,
  Baby,
  Ear,
  Stethoscope
} from 'lucide-react';
import { healthArticles } from './data';
import type { HealthArticle } from './types';

interface PatientArticlesProps {
  selectedArticleId: string | null;
  onCloseArticle: () => void;
}

export default function PatientArticles({ selectedArticleId, onCloseArticle }: PatientArticlesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Tất cả']);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Sync prop selectedArticleId with local state activeArticleId
  useEffect(() => {
    if (selectedArticleId) {
      setActiveArticleId(selectedArticleId);
    }
  }, [selectedArticleId]);

  // Load saved articles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_articles_ids');
    if (saved) {
      try {
        setSavedArticleIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved articles:', e);
      }
    }
  }, []);

  // Save bookmarked articles to localStorage
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent opening the article when clicking the bookmark button
    }
    const isSaved = savedArticleIds.includes(id);
    let updated: string[];
    if (isSaved) {
      updated = savedArticleIds.filter(item => item !== id);
    } else {
      updated = [...savedArticleIds, id];
    }
    setSavedArticleIds(updated);
    localStorage.setItem('saved_articles_ids', JSON.stringify(updated));
  };

  // Sort articles by date (newest first)
  const sortedArticles = [...healthArticles].sort((a, b) => {
    const dateA = a.publishedAt.split('/').reverse().join('-');
    const dateB = b.publishedAt.split('/').reverse().join('-');
    return dateB.localeCompare(dateA);
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  // Handle category toggle logic for multi-select (toggleCategory)
  const toggleCategory = (categoryName: string) => {
    if (categoryName === 'Tất cả') {
      setSelectedCategories(['Tất cả']);
    } else {
      let updated = selectedCategories.filter(c => c !== 'Tất cả');
      if (updated.includes(categoryName)) {
        updated = updated.filter(c => c !== categoryName);
      } else {
        updated = [...updated, categoryName];
      }
      
      if (updated.length === 0) {
        setSelectedCategories(['Tất cả']);
      } else {
        setSelectedCategories(updated);
      }
    }
  };

  // Filter articles based on selected categories and search query
  const filteredArticles = sortedArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategories.includes('Tất cả')) return matchesSearch;
    return selectedCategories.includes(article.category) && matchesSearch;
  });

  // Dynamic list of categories for tabs (excluding duplicates & "Đã lưu")
  const categories = ['Tất cả', 'Tim mạch', 'Nhi khoa', 'Tai Mũi Họng', 'Tiêu hóa', 'Đời sống'];

  // Count items for each category
  const getCount = (cat: string) => {
    if (cat === 'Tất cả') return healthArticles.length;
    return healthArticles.filter(a => a.category === cat).length;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tim mạch':
        return <Heart size={14} className="shrink-0" />;
      case 'Nhi khoa':
        return <Baby size={14} className="shrink-0" />;
      case 'Tai Mũi Họng':
        return <Ear size={14} className="shrink-0" />;
      case 'Tiêu hóa':
        return <Stethoscope size={14} className="shrink-0" />;
      case 'Đời sống':
        return <Activity size={14} className="shrink-0" />;
      default:
        return <BookOpen size={14} className="shrink-0" />;
    }
  };

  const currentArticle = healthArticles.find(a => a.id === (activeArticleId || selectedArticleId));

  useEffect(() => {
    if (!currentArticle) {
      return;
    }

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [currentArticle]);

  const hasArticles = filteredArticles.length > 0;
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  
  // Slice articles for pagination
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const closeArticle = () => {
    setActiveArticleId(null);
    onCloseArticle();
  };

  const readerOverlay = currentArticle ? createPortal(
    <>
      <div
        onClick={closeArticle}
        className="articles-overlay"
        aria-hidden="true"
      />

      <div className="articles-drawer">
        <div className="articles-drawer-header">
          <button
            type="button"
            onClick={closeArticle}
            className="articles-drawer-back"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          <div className="articles-drawer-actions">
            <button
              type="button"
              onClick={() => toggleBookmark(currentArticle.id)}
              className={`articles-bookmark ${
                savedArticleIds.includes(currentArticle.id) ? 'articles-bookmark--saved' : ''
              }`}
              title={savedArticleIds.includes(currentArticle.id) ? "Bỏ lưu bài viết" : "Lưu bài viết"}
            >
              <Heart size={18} fill={savedArticleIds.includes(currentArticle.id) ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={closeArticle}
              className="articles-drawer-close"
              aria-label="Đóng bảng đọc"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="articles-drawer-scroll">
          <div className="articles-reader-cover">
            <img
              src={currentArticle.imageUrl}
              alt={currentArticle.title}
            />
            <div className="articles-reader-cover-overlay" />
            <span className="articles-reader-cover-tag">
              {currentArticle.category}
            </span>
          </div>

          <article className="articles-reader-body">
            <h1 className="articles-reader-title">
              {currentArticle.title}
            </h1>

            <div className="articles-reader-meta">
              <span className="articles-reader-meta-item">
                <User size={14} className="articles-meta-icon" />
                <span>Tác giả: <strong>{currentArticle.author}</strong></span>
              </span>
              <span className="articles-reader-meta-dot">•</span>
              <span className="articles-reader-meta-item">
                <Calendar size={14} className="articles-meta-icon" />
                <span>Đăng ngày: <strong>{currentArticle.publishedAt}</strong></span>
              </span>
              <span className="articles-reader-meta-dot">•</span>
              <span className="articles-reader-meta-item">
                <Clock size={14} className="articles-meta-icon" />
                <span>Thời gian đọc: <strong>{currentArticle.readTime}</strong></span>
              </span>
            </div>

            <div className="articles-reader-content">
              {currentArticle.content.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="articles-reader-disclaimer">
              <p>
                Lưu ý: Nội dung bài viết chỉ mang tính chất tham khảo kiến thức y khoa, không thay thế cho chẩn đoán hay điều trị thực tế. Khi phát hiện các triệu chứng bất thường, người bệnh cần tới trực tiếp bệnh viện hoặc cơ sở y tế gần nhất để được khám chữa trị chính xác.
              </p>
            </div>
          </article>
        </div>
      </div>
    </>,
    document.body,
  ) : null;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="articles-header">
        <div>
          <h1 className="articles-title">
            <span className="articles-title-icon">
              <BookOpen size={20} />
            </span>
            Cẩm nang Y tế & Sức khỏe
          </h1>
          <p className="articles-subtitle">
            Không gian đọc kiến thức y khoa chính thống và chuyên sâu từ các chuyên gia
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="articles-search">
          <Search className="articles-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="articles-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="articles-search-clear"
              type="button"
              aria-label="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* MULTI-SELECT CATEGORY PILLS (SPECIALTY FILTER) */}
      <div className="mb-6">
        <div className="text-xs font-bold text-gray-500 uppercase mb-2">LỌC THEO CHUYÊN KHOA (CHỌN NHIỀU):</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategories.includes(cat);
            const count = getCount(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 px-1.5 rounded-full text-[10px] font-bold transition-colors duration-200 ${
                  isActive ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ARTICLES CONTENT */}
      {hasArticles ? (
        <div className="space-y-8">
          {/* GRID LAYOUT (UNIFORM ARTICLES CARDS) */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedArticles.map((article) => {
              const isSaved = savedArticleIds.includes(article.id);
              return (
                <div
                  key={article.id}
                  onClick={() => setActiveArticleId(article.id)}
                  className="articles-card"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="articles-card-cover">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(article.id, e)}
                        className={`articles-bookmark ${isSaved ? 'articles-bookmark--saved' : ''}`}
                        style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 5 }}
                        aria-label="Bookmark article"
                      >
                        <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="articles-card-body">
                      <span className="articles-card-category">
                        {article.category}
                      </span>
                      <h3 className="articles-card-title">
                        {article.title}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="articles-card-footer">
                    <span className="articles-meta" style={{ maxWidth: '110px' }}>
                      <User size={12} className="articles-meta-icon" />
                      <span className="truncate">{article.author}</span>
                    </span>
                    <span className="articles-meta">
                      <Calendar size={12} className="articles-meta-icon" />
                      {article.publishedAt}
                    </span>
                    <span className="articles-meta" style={{ marginLeft: 'auto' }}>
                      <Clock size={12} className="articles-meta-icon" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION SYSTEM */}
          {totalPages > 1 && (
            <div className="articles-pagination">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="articles-pagination-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`articles-pagination-btn ${
                    currentPage === page ? 'articles-pagination-btn--active' : ''
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="articles-pagination-btn"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="articles-empty">
          <div className="articles-empty-icon">
            <BookOpen size={24} />
          </div>
          <h3 className="articles-empty-title">Không tìm thấy bài viết nào</h3>
          <p className="articles-empty-desc">
            Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh các chuyên khoa đang lọc.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategories(['Tất cả']); }}
            className="btn-secondary"
            style={{ marginTop: 'var(--spacing-md)' }}
            type="button"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {readerOverlay}
    </div>
  );
}
