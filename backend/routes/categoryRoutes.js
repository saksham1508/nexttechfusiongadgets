const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { auth, adminAuth } = require('../middleware/auth');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { level, parent, active = true } = req.query;
  
  let query = {};
  
  if (level !== undefined) {
    query.level = parseInt(level);
  }
  
  if (parent) {
    query.parent = parent === 'null' ? null : parent;
  }
  
  if (active !== 'all') {
    query.isActive = active === 'true';
  }
  
  const categories = await Category.find(query)
    .populate('parent', 'name slug')
    .populate('children', 'name slug image')
    .populate('featuredProducts', 'name price images rating')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('children', 'name slug image')
    .sort({ sortOrder: 1, name: 1 });
  
  // Build tree structure
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => String(cat.parent) === String(parentId))
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };
  
  const tree = buildTree();
  
  res.json({
    success: true,
    data: tree
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug')
    .populate('children', 'name slug image')
    .populate('featuredProducts', 'name price images rating numReviews');
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Get products count in this category
  const productCount = await Product.countDocuments({ 
    category: category._id,
    isActive: true 
  });
  
  res.json({
    success: true,
    data: {
      ...category.toObject(),
      productCount
    }
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('parent', 'name slug')
    .populate('children', 'name slug image')
    .populate('featuredProducts', 'name price images rating numReviews');
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Get products count in this category
  const productCount = await Product.countDocuments({ 
    category: category._id,
    isActive: true 
  });
  
  res.json({
    success: true,
    data: {
      ...category.toObject(),
      productCount
    }
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    parent,
    seoTitle,
    seoDescription,
    seoKeywords,
    attributes
  } = req.body;
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }
  
  // Calculate level based on parent
  let level = 0;
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      res.status(400);
      throw new Error('Parent category not found');
    }
    level = parentCategory.level + 1;
  }
  
  const category = await Category.create({
    name,
    description,
    image,
    parent: parent || null,
    level,
    seoTitle,
    seoDescription,
    seoKeywords,
    attributes
  });
  
  // Update parent's children array
  if (parent) {
    await Category.findByIdAndUpdate(parent, {
      $push: { children: category._id }
    });
  }
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('parent', 'name slug')
   .populate('children', 'name slug image');
  
  res.json({
    success: true,
    data: updatedCategory
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category with existing products');
  }
  
  // Check if category has children
  if (category.children.length > 0) {
    res.status(400);
    throw new Error('Cannot delete category with subcategories');
  }
  
  // Remove from parent's children array
  if (category.parent) {
    await Category.findByIdAndUpdate(category.parent, {
      $pull: { children: category._id }
    });
  }
  
  await category.deleteOne();
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// Routes
router.route('/')
  .get(getCategories)
  .post(auth, adminAuth, createCategory);

router.get('/tree', getCategoryTree);

router.route('/:id')
  .get(getCategory)
  .put(auth, adminAuth, updateCategory)
  .delete(auth, adminAuth, deleteCategory);

router.get('/slug/:slug', getCategoryBySlug);

module.exports = router;