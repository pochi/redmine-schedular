# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

Rails.application.routes.draw do
  resources :projects do
    match '/schedulers/home' => 'schedulers#home'
    resources :schedulers do
      resources :events
      resource :participations, :only => [:destroy]
      resources :participations, :only => [:create]
    end
  end

  resources :schedulers
end
