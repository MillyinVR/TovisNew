import React, { useState } from 'react';
import { Package, DollarSign, ShoppingBag, BarChart, Plus, Pencil, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  sales: number;
}

export const StoreTab = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Professional Setting Spray',
      description: 'Long-lasting makeup setting spray for all skin types',
      price: 35,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1527156231393-7023794f363c',
      category: 'Finishing',
      sales: 48
    },
    {
      id: '2',
      name: 'Luxury Foundation Brush',
      description: 'Professional-grade synthetic foundation brush',
      price: 45,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282',
      category: 'Tools',
      sales: 32
    }
  ]);

  const [showAddProduct, setShowAddProduct] = useState(false);

  return (
    <div className="space-y-6">
      {/* Store Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Store Management</h2>
            <p className="text-sm text-gray-500">
              Manage your product inventory and sales
            </p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-lg font-semibold text-gray-900">{products.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-lg font-semibold text-gray-900">$2,450</h3>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <h3 className="text-lg font-semibold text-gray-900">3</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Product
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Stock
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Sales
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded object-cover" src={product.image} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${product.price}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Analytics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Analytics</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <BarChart className="h-8 w-8 mr-2" />
          <span>Sales chart will be displayed here</span>
        </div>
      </div>
    </div>
  );
};