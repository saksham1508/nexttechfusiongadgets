import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, ChevronDown, Package } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchCategoryTree } from '../store/slices/categorySlice';
import { Category } from '../types';
import './CategoryTree.css';

interface CategoryTreeProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string, category: Category) => void;
  showProductCount?: boolean;
  className?: string;
}

interface CategoryNodeProps {
  category: Category;
  level: number;
  selectedCategory?: string;
  onCategorySelect: (categoryId: string, category: Category) => void;
  showProductCount?: boolean;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  selectedCategory,
  onCategorySelect,
  showProductCount = false
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategory === category._id;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onCategorySelect(category._id, category);
  };

  return (
    <div className="category-node">
      <div
        className={`category-node-item ${isSelected ? 'selected' : ''}`}
        data-level={level <= 9 ? level : undefined}
        style={level > 9 ? { '--level': level } as React.CSSProperties : undefined}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="category-toggle-button"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="category-icon-placeholder" />
        )}

        <div
          onClick={handleSelect}
          className="category-content"
        >
          {category.image?.url ? (
            <img
              src={category.image.url}
              alt={category.image.alt || category.name}
              className="category-image"
            />
          ) : (
            <Package className="category-icon" />
          )}

          <div className="category-info">
            <div className="category-header">
              <span className="category-name">{category.name}</span>
              {showProductCount && category.productCount !== undefined && (
                <span className="category-product-count">
                  ({category.productCount})
                </span>
              )}
            </div>
            {category.description && level === 0 && (
              <p className="category-description">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="category-children">
          {category.children.map((child) => (
            <CategoryNode
              key={child._id}
              category={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
              showProductCount={showProductCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  selectedCategory,
  onCategorySelect,
  showProductCount = false,
  className = ''
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categoryTree, loading, error } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, categoryTree.length]);

  if (loading) {
    return (
      <div className={`category-tree ${className}`}>
        <div className="category-tree-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="category-tree-loading-item"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`category-tree ${className}`}>
        <div className="category-tree-error">
          Error loading categories: {error}
        </div>
      </div>
    );
  }

  if (categoryTree.length === 0) {
    return (
      <div className={`category-tree ${className}`}>
        <div className="category-tree-empty">
          No categories available
        </div>
      </div>
    );
  }

  return (
    <div className={`category-tree ${className}`}>
      <div className="space-y-1">
        {categoryTree.map((category) => (
          <CategoryNode
            key={category._id}
            category={category}
            level={0}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            showProductCount={showProductCount}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryTree;