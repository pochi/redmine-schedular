require_dependency 'application_controller'

module SchedulerApplicationControllerPatch
  def self.included base
    base.class_eval do
      private
      def current_project
        begin
          @project = Project.find(params[:project_id])
        rescue ActiveRecord::RecordNotFound
          render_404
        end
      end

      def current_schedules
        @schedules = current_project.schedules
      end

      def current_schedule
        begin
          @schedule ||= current_project.schedules.find(params[:scheduler_id])
        rescue ActiveRecord::RecordNotFound
          render_404
        end
      end

      def current_date
        if params[:year] and params[:month]
          Date.new(params[:year].to_i, params[:month].to_i)
        else
          Date.new(Time.now.year, Time.now.month)
        end
      end

      def current_user
        User.current = User.find(session[:user_id]) if session[:user_id]
        @curent_user = User.current
      end

      def login_required
        return true if User.current.logged?
        require_login
      end

      helper_method :current_project
    end
  end
end

ApplicationController.send(:include, SchedulerApplicationControllerPatch)
