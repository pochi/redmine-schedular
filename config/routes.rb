# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

Rails.application.routes.draw do
  resources :projects do
    match '/schedulers/home' => 'schedulers#home'
    resources :schedulers do
      resources :events, :only => [:create, :update, :destroy]
      resource :participations, :only => [:destroy]
      resources :participations, :only => [:create]
    end
  end

  match '/schedulers/settings', :to => 'schedulers#settings', :via => :post
  resources :scheduler_custom_list_contents
  resources :scheduler_settings
end
