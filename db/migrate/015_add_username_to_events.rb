class AddUsernameToEvents < ActiveRecord::Migration
  def change
    add_column :events, :username, :string, :null => false
  end
end
