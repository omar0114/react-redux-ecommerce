import * as t from './actionTypes'
import api from 'lib/api'
import messages from 'src/locale'

function requestProducts() {
  return {
    type: t.PRODUCTS_REQUEST
  }
}

function requestMoreProducts() {
  return {
    type: t.PRODUCTS_MORE_REQUEST
  }
}

function receiveProductsMore(items) {
  return {
    type: t.PRODUCTS_MORE_RECEIVE,
    items
  }
}

function receiveProducts(items) {
  return {
    type: t.PRODUCTS_RECEIVE,
    items
  }
}

function receiveProductsError(error) {
  return {
    type: t.PRODUCTS_FAILURE,
    error
  }
}

export function selectProduct(id) {
  return {
    type: t.PRODUCTS_SELECT,
    productId: id
  }
}

export function deselectProduct(id) {
  return {
    type: t.PRODUCTS_DESELECT,
    productId: id
  }
}

export function deselectAllProduct() {
  return {
    type: t.PRODUCTS_DESELECT_ALL
  }
}

export function selectAllProduct() {
  return {
    type: t.PRODUCTS_SELECT_ALL
  }
}

export function setFilterSearch(value) {
  return {
    type: t.PRODUCTS_FILTER_SET_SEARCH,
    search: value
  }
}

export function setFilterStock(value) {
  return {
    type: t.PRODUCTS_FILTER_SET_STOCK,
    stock_status: value
  }
}

export function setFilterActive(value) {
  return {
    type: t.PRODUCTS_FILTER_SET_ACTIVE,
    active: value
  }
}

export function setFilterDiscontinued(value) {
  return {
    type: t.PRODUCTS_FILTER_SET_DISCONTINUED,
    discontinued: value
  }
}

export function setFilterOnSale(value) {
  return {
    type: t.PRODUCTS_FILTER_SET_ONSALE,
    on_sale: value
  }
}

function deleteProductsSuccess() {
  return {
    type: t.PRODUCT_DELETE_SUCCESS
  }
}

function setCategorySuccess() {
  return {
    type: t.PRODUCT_SET_CATEGORY_SUCCESS
  }
}

// function requestUpdateProduct(id) {
//   return {
//     type: t.PRODUCT_UPDATE_REQUEST
//   }
// }

// function receiveUpdateProduct() {
//   return {
//     type: t.PRODUCT_UPDATE_SUCCESS
//   }
// }

// function errorUpdateProduct(error) {
//   return {
//     type: t.PRODUCT_UPDATE_FAILURE,
//     error
//   }
// }

// function successCreateProduct(id) {
//   return {
//     type: t.PRODUCT_CREATE_SUCCESS
//   }
// }

export function fetchProducts() {
  return (dispatch, getState) => {
    const state = getState();
    if (!state.products.isFetching) {
      dispatch(requestProducts());
      dispatch(deselectAllProduct());

      let filter = { limit: 20, fields: 'id,name,category_id,category_name,sku,images,active,discontinued,stock_status,stock_quantity,price,currency,on_sale,regular_price' };
      filter.search = state.products.filter_search;

      if(state.products.filter_stock_status && state.products.filter_stock_status !== 'all') {
        filter.stock_status = state.products.filter_stock_status;
      }

      if(state.productCategories.selectedId) {
        filter.category_id = state.productCategories.selectedId;
      }

      if(state.products.filter_active) {
        filter.active = true;
      }

      if(state.products.filter_discontinued) {
        filter.discontinued = true;
      }

      if(state.products.filter_on_sale) {
        filter.on_sale = true;
      }

      return api.products.list(filter)
        .then(({status, json}) => {
          json = json.sort((a,b) => (a.position - b.position ));

          json.forEach((element, index, theArray) => {
            if(theArray[index].name === '') {
              theArray[index].name = `<${messages.draft}>`;
            }
          })

          dispatch(receiveProducts(json))
        })
        .catch(error => {
            dispatch(receiveProductsError(error));
        });
    }
  }
}

export function fetchMoreProducts() {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(requestMoreProducts());

    let filter = { limit: 50, fields: 'id,name,category_id,category_name,sku,images,active,discontinued,stock_status,stock_quantity,price,currency,on_sale,regular_price' };
    filter.offset = state.products.items.length;
    filter.search = state.products.filter_search;

    if(state.products.filter_stock_status && state.products.filter_stock_status !== 'all') {
      filter.stock_status = state.products.filter_stock_status;
    }

    if(state.productCategories.selectedId) {
      filter.category_id = state.productCategories.selectedId;
    }

    if(state.products.filter_active) {
      filter.active = true;
    }

    if(state.products.filter_discontinued) {
      filter.discontinued = true;
    }

    if(state.products.filter_on_sale) {
      filter.on_sale = true;
    }

    return api.products.list(filter)
      .then(({status, json}) => {
        json = json.sort((a,b) => (a.position - b.position ));

        json.forEach((element, index, theArray) => {
          if(theArray[index].name === '') {
            theArray[index].name = `<${messages.draft}>`;
          }
        })

        dispatch(receiveProductsMore(json))
      })
      .catch(error => {
          dispatch(receiveProductsError(error));
      });
  }
}

export function deleteProducts() {
  return (dispatch, getState) => {
    const state = getState();
    let promises = state.products.selected.map(productId => api.products.delete(productId));

    return Promise.all(promises).then(values => {
      dispatch(deleteProductsSuccess());
      dispatch(deselectAllProduct());
      dispatch(fetchProducts());
    }).catch(err => { console.log(err) });
  }
}

export function setCategory(category_id) {
  return (dispatch, getState) => {
    const state = getState();
    let promises = state.products.selected.map(productId => api.products.update(productId, { category_id: category_id }));

    return Promise.all(promises).then(values => {
      dispatch(setCategorySuccess());
      dispatch(deselectAllProduct());
      dispatch(fetchProducts());
    }).catch(err => { console.log(err) });
  }
}

// function sendUpdateProduct(id, data) {
//   return dispatch => {
//     dispatch(requestUpdateProduct(id));
//     return api.products.update(id, data)
//       .then(({status, json}) => {
//           dispatch(receiveUpdateProduct());
//           dispatch(fetchProducts());
//       })
//       .catch(error => {
//           dispatch(errorUpdateProduct(error));
//       });
//   }
// }

// export function updateProduct(data) {
//   return (dispatch, getState) => {
//     return dispatch(sendUpdateProduct(data.id, data))
//   }
// }

// export function createProduct() {
//   return (dispatch, getState) => {
//     return api.products.create({ active: false })
//       .then(({status, json}) => {
//           dispatch(successCreateProduct(json.id));
//           dispatch(fetchProducts());
//           dispatch(selectProduct(json.id));
//       })
//       .catch(error => {
//           //dispatch error
//           console.log(error)
//       });
//   }
// }
