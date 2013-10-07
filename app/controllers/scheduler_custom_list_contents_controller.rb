class SchedulerCustomListContentsController < ApplicationController
  unloadable

  def create
    @scheduler_custom_list_content = SchedulerCustomList.current.scheduler_custom_list_contents
                                                                .build(:name => params[:name])
    if @scheduler_custom_list_content.save
      render :template => "scheduler_custom_list_contents/create",
             :handlers => [:erb],
             :formats => [:js]
    end
  end
end
